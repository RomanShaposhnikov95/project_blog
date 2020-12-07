(function() {
    const readJSON = path => {
        return new Promise((resolve, reject) => {
            const rawFile = new XMLHttpRequest();

            rawFile.overrideMimeType('application/json');
            rawFile.open('GET', `./assets/json/${path}.json`, true);
            rawFile.onreadystatechange = () => {
                if (rawFile.readyState === 4 && rawFile.status == '200') {
                    const result = JSON.parse(rawFile.responseText);

                    resolve(result);
                }

                if (rawFile.status == '404') {
                    reject(null);
                }
            }

            rawFile.send(null);
        });
    };

    if (_settings) {
        Object.keys(_settings).forEach(name => {
            const { url } = _settings[name];

            readJSON(url)
                .then(result => {
                    const attribute = `data-translate-${url}`;
                    const elements = document.querySelectorAll(`[${attribute}]`);

                    if (elements) {
                        elements.forEach(element => {
                            const translateKey = element.getAttribute(attribute);

                            element.innerHTML = result[translateKey];
                            element.removeAttribute(attribute);
                        });
                    }
                })
                .catch((error) => {
                    console.error('error', error);
                })
        });

        const settingAttribute = 'data-setting';
        const configAttribute = 'data-config';
        const settings = document.querySelectorAll(`[${settingAttribute}]`);

        if (settings) {
            settings.forEach(setting => {
                const parentKey = setting.getAttribute(settingAttribute);
                const childKey = setting.getAttribute(configAttribute);

                if (parentKey && childKey) {
                    setting.innerHTML = _settings[parentKey][childKey];

                    setting.removeAttribute(settingAttribute);
                    setting.removeAttribute(configAttribute);
                }
            });
        }
    }

    const emulateRequest = data => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    message: 'success',
                    data
                });
            }, 2500);
        })
    }
    

    const sendEmail = () => {
        emulateRequest() 
            .then(response => {
                console.log('success', response.data);
            })
            .catch(error => {
                confirm.error('error', error);
            });
    }



    const input = document.querySelector('.send-email');
    input.addEventListener('click', sendEmail);
    
}());
