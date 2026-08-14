export default async function handler(req, res) {
  try {
    const apiKey = process.env.VITE_OCM_API_KEY || '6df7a3b1-a596-4ae0-80aa-031f3756bd21';
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'evtn-35d2e';

    console.log(`[Cron Sync] Starting daily sync at ${new Date().toISOString()}...`);

    // 1. Fetch live POIs from OpenChargeMap
    const ocmRes = await fetch(
      `https://api.openchargemap.io/v3/poi/?output=json&countrycode=TN&maxresults=200&key=${apiKey}`
    );

    if (!ocmRes.ok) {
      throw new Error(`OpenChargeMap returned HTTP ${ocmRes.status}`);
    }

    const ocmData = await ocmRes.json();
    console.log(`[Cron Sync] Fetched ${ocmData.length} stations from OpenChargeMap.`);

    let syncedCount = 0;

    // 2. Format and Sync each station into Firebase Firestore via REST API
    for (const ocm of ocmData) {
      const address = ocm.AddressInfo || {};
      let connectors = [];
      let maxPower = 0;

      if (ocm.Connections && ocm.Connections.length > 0) {
        ocm.Connections.forEach(conn => {
          if (conn.ConnectionType) {
            const typeTitle = conn.ConnectionType.Title || '';
            if (typeTitle.includes('Type 2')) connectors.push('Type 2');
            else if (typeTitle.includes('CCS')) connectors.push('CCS');
            else if (typeTitle.includes('CHAdeMO')) connectors.push('CHAdeMO');
            else connectors.push('Prise domestique');
          }
          if (conn.PowerKW && conn.PowerKW > maxPower) {
            maxPower = conn.PowerKW;
          }
        });
      }

      connectors = [...new Set(connectors)];
      if (connectors.length === 0) connectors = ['Type 2'];
      if (maxPower === 0) maxPower = 22;

      let status = 'available';
      if (ocm.StatusType && ocm.StatusType.IsOperational === false) {
        status = 'offline';
      }

      const docId = `tn-real-${ocm.ID}`;
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stations/${docId}`;

      // Check if the station was recently updated by a human user
      try {
        const checkRes = await fetch(firestoreUrl);
        if (checkRes.ok) {
          const docData = await checkRes.json();
          const currentUpdatedBy = docData.fields?.updatedBy?.stringValue || '';
          const currentLastUpdate = docData.fields?.lastUpdate?.stringValue;
          
          // If updated by a real user in the last 24h, preserve the user's input!
          const isUserUpdate = currentUpdatedBy && 
            !currentUpdatedBy.startsWith('Auto-Sync') && 
            !currentUpdatedBy.startsWith('OpenChargeMap') && 
            currentUpdatedBy !== 'Système (Auto)';

          if (isUserUpdate && currentLastUpdate) {
            const hoursSinceUserUpdate = (new Date() - new Date(currentLastUpdate)) / (1000 * 60 * 60);
            if (hoursSinceUserUpdate < 24) {
              console.log(`[Cron Sync] Preserving user update by "${currentUpdatedBy}" for station ${docId}`);
              continue; // Skip overwriting user's update
            }
          }
        }
      } catch (checkErr) {
        // Document might not exist yet, proceed with patch/upsert
      }

      // Construct Firestore REST payload
      const fields = {
        name: { stringValue: address.Title || 'Station Recharge' },
        address: { stringValue: address.AddressLine1 || address.Title || 'Tunisie' },
        city: { stringValue: address.Town || 'Tunisie' },
        lat: { doubleValue: address.Latitude },
        lng: { doubleValue: address.Longitude },
        power: { integerValue: maxPower },
        connectors: {
          arrayValue: {
            values: connectors.map(c => ({ stringValue: c }))
          }
        },
        status: { stringValue: status },
        price: { stringValue: ocm.UsageCost || 'Information sur place' },
        operator: { stringValue: ocm.OperatorInfo ? ocm.OperatorInfo.Title : 'Réseau National TN' },
        openHours: { stringValue: '24/7' },
        lastUpdate: { stringValue: new Date().toISOString() },
        updatedBy: { stringValue: 'Auto-Sync (23h59)' },
        reference: { stringValue: `OCM-${ocm.ID}` },
        isSmart: { booleanValue: true }
      };

      try {
        await fetch(`${firestoreUrl}?updateMask.fieldPaths=status&updateMask.fieldPaths=lastUpdate&updateMask.fieldPaths=power`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        });
        syncedCount++;
      } catch (err) {
        console.error(`Error updating station ${docId}:`, err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Synchronisation quotidienne terminée à 23h59. ${syncedCount} bornes mises à jour.`,
      syncedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron Sync Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
