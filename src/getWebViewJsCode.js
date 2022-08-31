export const getWebViewJsCode = (streamUrl) => `
  const playerOrigin = "${streamUrl}";
  let fetchController;
  let fetchSignal = null;
  const Heads = new Headers({"Icy-Metadata": "1"});

  let stream = new ReadableStream({
    start(controller) {
      try {
        let songs = Array();
        fetchController = new AbortController();
        let signal = fetchController.signal;
        let decoder = new TextDecoder();
        let startFetch = fetch(playerOrigin, { signal, headers: Heads });

        function pushStream(response) {
          let metaint = 16000;
          let stream = response.body;
          let reader = stream.getReader();
          return reader.read().then(function process(result) {
            if (result.done) return;
            const chunk = result.value;

            for (let i = 0; i < chunk.length; i++) {
              songs.push(chunk[i]);

              if (songs.length > metaint + 4080) {
                const musicData = Uint8Array.from(songs.splice(0, metaint));
                const metalength = songs.shift() * 16;

                if (metalength > 0) {
                  const metaStr = decoder.decode(
                    Uint8Array.from(songs.splice(0, metalength))
                  );

                  const metadata = {}
                  const variables = metaStr.split(";").filter(variable => !!variable)

                  for (const variable of variables) {
                    if (variable.includes("=")) {
                      const [key, value] = variable.split("=")
                      metadata[key] = value.replaceAll("'", "")
                    }
                  }

                  window.ReactNativeWebView.postMessage(JSON.stringify(metadata));
                }

                if (fetchSignal == 1) {
                  fetchController.abort();
                }

                controller.enqueue(musicData);
              }
            }

            return reader.read().then(process);
          });
        }

        startFetch
          .then((response) => pushStream(response))
          .then(() => controller.close())
          .catch(function (e) {
            fetchSignal = 0;
          });
      } catch (ex) {
        alert(ex)
      }
    }
  });
`;
