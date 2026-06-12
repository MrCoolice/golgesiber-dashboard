fetch('https://www.getmidas.com/canli-borsa/altins1-hisse/')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/Güncel Fiyat.*?&#8378;([0-9,]+)/is);
    if (match) {
      console.log('Price:', match[1]);
    } else {
      const priceMatch = t.match(/&#8378;([0-9,]+)/);
      console.log('Any Price:', priceMatch ? priceMatch[1] : 'Not Found');
      const spanMatch = t.match(/<span[^>]*>(79,[0-9]+)<\/span>/);
      console.log('Span Match:', spanMatch ? spanMatch[1] : 'Not Found');
    }
  })
  .catch(console.error);
