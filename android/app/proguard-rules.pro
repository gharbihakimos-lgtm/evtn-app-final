# Add project specific ProGuard rules here.
# For more details, see: http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor & Cordova Plugin Keep Rules
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve line numbers and source files for Google Play crash de-obfuscation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
