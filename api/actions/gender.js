function rnd() {
  return Math.floor(Math.random() * 30);
}

export default function gender() {
  return new Promise((resolve) => {
    resolve({
      male: [
        {x: 2005, y: rnd()},
        {x: 2006, y: rnd()},
        {x: 2007, y: rnd()},
        {x: 2008, y: rnd()},
        {x: 2009, y: rnd()},
        {x: 2010, y: rnd()}
      ],
      female: [
        {x: 2005, y: - rnd()},
        {x: 2006, y: - rnd()},
        {x: 2007, y: - rnd()},
        {x: 2008, y: - rnd()},
        {x: 2009, y: - rnd()},
        {x: 2010, y: - rnd()}
      ]
    });
  });
}
