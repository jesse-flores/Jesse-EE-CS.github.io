fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    
    const logData = {
      key: "something_very_secretive_muahahahahaha",
      ip: data.ip,
      loc: `${data.city}, ${data.country_name}`,
      ua: navigator.userAgent
    };

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwFNEL55Ch8-oLgnWQTIdoXFdB8p2d0JxjrXDaOIG5AqPK_hjGeG5IU7FXHPyuY5p_utw/exec";

    fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(logData),
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    });
  })
  .catch(() => {
  });