import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import type { WikiStackParamList } from './WikipediaNavigator';

type RouteT = RouteProp<WikiStackParamList, 'WikiArticle'>;

const CSS_INJECT = `
  (function() {
    var style = document.createElement('style');
    style.textContent = \`
      body { background: #0D0F0A !important; color: #C8D4B8 !important; font-family: Georgia, serif !important; }
      a { color: #7AB648 !important; }
      table { background: #161A10 !important; }
      .mw-header, #mw-navigation, #footer, .mw-portlet, #p-tb { display: none !important; }
      img { max-width: 100% !important; opacity: 0.85; }
      h1, h2, h3 { color: #B8962E !important; }
      pre, code { background: #161A10 !important; color: #C8D4B8 !important; }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;

export function WikiArticleScreen() {
  const { params } = useRoute<RouteT>();
  const nav = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{params.title}</Text>
      </View>

      <WebView
        source={{ uri: params.url }}
        style={styles.webview}
        injectedJavaScript={CSS_INJECT}
        onMessage={() => {}}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        backgroundColor={Colors.bg}
      />

      <OfflineStatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', marginRight: 8 },
  backText: { fontFamily: Fonts.mono, fontSize: 14, color: Colors.accent },
  title: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.text, flex: 1 },
  webview: { flex: 1, backgroundColor: Colors.bg },
});
