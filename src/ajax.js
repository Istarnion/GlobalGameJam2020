
export const ajax = {
    get: (url) => {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState === XMLHttpRequest.DONE)
                {
                    if(request.status === 200)
                    {
                        resolve(request.responseText);
                    }
                    else
                    {
                        console.error(`GET request for ${url} failed with code ${request.status}.`);
                        reject(url);
                    }
                }
            };

            request.open('GET', url);
            request.send();
        });
    }
};
