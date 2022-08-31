import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNetInfo } from '@react-native-community/netinfo';

import { getWebViewJsCode } from './getWebViewJsCode';

export const useMeta = ({ streamUrl, onMetaUpdate }) => {
  const netInfo = useNetInfo();
  const [metadata, setMetadata] = useState({});

  const onMessage = (data) => {
    const meta = JSON.parse(data.nativeEvent.data);
    if (typeof onMetaUpdate === 'function') onMetaUpdate(msg);
    setMetadata(meta);
  };

  const MetaView = useMemo(() => {
    const jsCode = getWebViewJsCode(streamUrl);

    const MView = () =>
      netInfo.isConnected && (
        <View style={{ position: 'absolute' }}>
          <WebView
            onMessage={onMessage}
            javaScriptEnabled={true}
            injectedJavaScript={jsCode}
            startInLoadingState={true}
            automaticallyAdjustContentInsets={false}
          />
        </View>
      );

    return MView;
  }, [streamUrl, netInfo.isConnected]);

  return {
    metadata,
    MetaView
  };
};
