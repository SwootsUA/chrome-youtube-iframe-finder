document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('findVideos').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            const list = document.getElementById('videoLinks');
            list.innerHTML = '';
            const li = document.createElement('li');

            if (tabs[0].url.startsWith('chrome://')) {
                li.textContent = "Can't access chrome:// url";
                console.log(`Can't access ${tabs[0].url} url`);
                list.appendChild(li);
                return;
            }

            chrome.scripting.executeScript(
                {target: {tabId: tabs[0].id}, func: findYouTubeIframes},
                injectionResults => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        return;
                    }

                    const links = injectionResults[0].result;

                    if (links.length === 0) {
                        li.textContent = 'No YouTube iframes found.';
                        list.appendChild(li);
                    } else {
                        links.forEach(link => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = link;
                            a.textContent = link;
                            a.target = '_blank';
                            li.appendChild(a);
                            list.appendChild(li);
                        });
                    }
                }
            );
        });
    });
});

function findYouTubeIframes() {
    const iframes = document.getElementsByTagName('iframe');
    const links = [];
    for (let i = 0; i < iframes.length; i++) {
        const src = iframes[i].src;
        if (src.includes('youtube.com/embed/')) {
            const match = src.match(/youtube\.com\/embed\/([^?]+)/);
            if (match && match[1]) {
                links.push('https://www.youtube.com/watch?v=' + match[1]);
            }
        }
    }
    return links;
}
