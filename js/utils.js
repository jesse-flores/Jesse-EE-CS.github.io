fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    const logData = {
      ip: data.ip,
      loc: `${data.city}, ${data.country_name}`,
      ua: navigator.userAgent
    };

    fetch("https://script.google.com/macros/s/AKfycbz3_ht4rtMqoG-aakbmKFSypvC7_SXkVHUuzEOtlQ3ASTJ3i9iGCucG8fSjaiONk6cIcw/exec", {
      method: "POST",
      body: JSON.stringify(logData),
      headers: {
        "Content-Type": "application/json"
      }
    });
  })
  .catch(() => {});