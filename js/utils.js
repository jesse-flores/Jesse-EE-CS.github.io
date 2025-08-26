fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    const logData = {
      ip: data.ip,
      loc: `${data.city}, ${data.country_name}`,
      ua: navigator.userAgent
    };

    fetch("https://script.google.com/macros/library/d/1J8LMBPLd3D7Mu5nZf98FOGNIzEFBv-jH3eMKk_xY46OKOm556lNTX4gE/6", {
      method: "POST",
      body: JSON.stringify(logData),
      headers: {
        "Content-Type": "application/json"
      }
    });
  })
  .catch(() => {});