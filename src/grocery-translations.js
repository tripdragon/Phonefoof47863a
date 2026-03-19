const groceryItems = [
  {
    name: "Apple",
    category: "Produce",
    translations: [
      { language: "Spanish", word: "manzana", phonetic: "mahn-SAH-nah" },
      { language: "French", word: "pomme", phonetic: "pohm" },
      { language: "German", word: "Apfel", phonetic: "AHP-fel" },
      { language: "Japanese", word: "りんご", phonetic: "reen-go" },
      { language: "Mandarin", word: "苹果", phonetic: "ping-gwoh" },
    ],
  },
  {
    name: "Banana",
    category: "Produce",
    translations: [
      { language: "Spanish", word: "plátano", phonetic: "PLAH-tah-noh" },
      { language: "French", word: "banane", phonetic: "bah-NAHN" },
      { language: "German", word: "Banane", phonetic: "bah-NAH-neh" },
      { language: "Japanese", word: "バナナ", phonetic: "bah-nah-nah" },
      { language: "Mandarin", word: "香蕉", phonetic: "syang-jyao" },
    ],
  },
  {
    name: "Bread",
    category: "Bakery",
    translations: [
      { language: "Spanish", word: "pan", phonetic: "pahn" },
      { language: "French", word: "pain", phonetic: "pan" },
      { language: "German", word: "Brot", phonetic: "broht" },
      { language: "Japanese", word: "パン", phonetic: "pahn" },
      { language: "Mandarin", word: "面包", phonetic: "myen-bao" },
    ],
  },
  {
    name: "Milk",
    category: "Dairy",
    translations: [
      { language: "Spanish", word: "leche", phonetic: "LEH-cheh" },
      { language: "French", word: "lait", phonetic: "leh" },
      { language: "German", word: "Milch", phonetic: "milkh" },
      { language: "Japanese", word: "牛乳", phonetic: "gyoo-nyoo" },
      { language: "Mandarin", word: "牛奶", phonetic: "nyoh-nai" },
    ],
  },
  {
    name: "Eggs",
    category: "Dairy",
    translations: [
      { language: "Spanish", word: "huevos", phonetic: "WAY-vohs" },
      { language: "French", word: "œufs", phonetic: "uh" },
      { language: "German", word: "Eier", phonetic: "EYE-er" },
      { language: "Japanese", word: "卵", phonetic: "tah-mah-go" },
      { language: "Mandarin", word: "鸡蛋", phonetic: "jee-dan" },
    ],
  },
  {
    name: "Rice",
    category: "Pantry",
    translations: [
      { language: "Spanish", word: "arroz", phonetic: "ah-ROHS" },
      { language: "French", word: "riz", phonetic: "ree" },
      { language: "German", word: "Reis", phonetic: "rice" },
      { language: "Japanese", word: "米", phonetic: "koh-meh" },
      { language: "Mandarin", word: "米", phonetic: "mee" },
    ],
  },
  {
    name: "Chicken",
    category: "Meat",
    translations: [
      { language: "Spanish", word: "pollo", phonetic: "POH-yoh" },
      { language: "French", word: "poulet", phonetic: "poo-lay" },
      { language: "German", word: "Hähnchen", phonetic: "HEN-khyen" },
      { language: "Japanese", word: "鶏肉", phonetic: "toh-ree-nee-koo" },
      { language: "Mandarin", word: "鸡肉", phonetic: "jee-roh" },
    ],
  },
  {
    name: "Fish",
    category: "Seafood",
    translations: [
      { language: "Spanish", word: "pescado", phonetic: "pehs-KAH-doh" },
      { language: "French", word: "poisson", phonetic: "pwah-sohn" },
      { language: "German", word: "Fisch", phonetic: "fish" },
      { language: "Japanese", word: "魚", phonetic: "sah-kah-nah" },
      { language: "Mandarin", word: "鱼", phonetic: "yoo" },
    ],
  },
  {
    name: "Tomato",
    category: "Produce",
    translations: [
      { language: "Spanish", word: "tomate", phonetic: "toh-MAH-teh" },
      { language: "French", word: "tomate", phonetic: "toh-MAHT" },
      { language: "German", word: "Tomate", phonetic: "toh-MAH-teh" },
      { language: "Japanese", word: "トマト", phonetic: "toh-mah-toh" },
      { language: "Mandarin", word: "西红柿", phonetic: "shee-hong-shrr" },
    ],
  },
  {
    name: "Potato",
    category: "Produce",
    translations: [
      { language: "Spanish", word: "papa", phonetic: "PAH-pah" },
      { language: "French", word: "pomme de terre", phonetic: "pohm duh tehr" },
      { language: "German", word: "Kartoffel", phonetic: "kar-TOF-fel" },
      { language: "Japanese", word: "じゃがいも", phonetic: "jah-gah-ee-moh" },
      { language: "Mandarin", word: "土豆", phonetic: "too-doh" },
    ],
  },
  {
    name: "Onion",
    category: "Produce",
    translations: [
      { language: "Spanish", word: "cebolla", phonetic: "seh-BOH-yah" },
      { language: "French", word: "oignon", phonetic: "ohn-yohn" },
      { language: "German", word: "Zwiebel", phonetic: "TSVEE-bel" },
      { language: "Japanese", word: "玉ねぎ", phonetic: "tah-mah-neh-ghee" },
      { language: "Mandarin", word: "洋葱", phonetic: "yang-tsoong" },
    ],
  },
  {
    name: "Cheese",
    category: "Dairy",
    translations: [
      { language: "Spanish", word: "queso", phonetic: "KEH-soh" },
      { language: "French", word: "fromage", phonetic: "froh-MAHZH" },
      { language: "German", word: "Käse", phonetic: "KEH-zeh" },
      { language: "Japanese", word: "チーズ", phonetic: "chee-zoo" },
      { language: "Mandarin", word: "奶酪", phonetic: "nai-lao" },
    ],
  },
  {
    name: "Yogurt",
    category: "Dairy",
    translations: [
      { language: "Spanish", word: "yogur", phonetic: "yoh-GOOR" },
      { language: "French", word: "yaourt", phonetic: "yah-oor" },
      { language: "German", word: "Joghurt", phonetic: "YOH-goort" },
      { language: "Japanese", word: "ヨーグルト", phonetic: "yoh-goo-roo-toh" },
      { language: "Mandarin", word: "酸奶", phonetic: "swan-nai" },
    ],
  },
  {
    name: "Orange juice",
    category: "Beverages",
    translations: [
      { language: "Spanish", word: "jugo de naranja", phonetic: "HOO-goh deh nah-RAHN-hah" },
      { language: "French", word: "jus d'orange", phonetic: "zhoo doh-rahnzh" },
      { language: "German", word: "Orangensaft", phonetic: "oh-RAHN-gen-zaft" },
      { language: "Japanese", word: "オレンジジュース", phonetic: "oh-ren-jee joo-soo" },
      { language: "Mandarin", word: "橙汁", phonetic: "chung-jrr" },
    ],
  },
  {
    name: "Coffee",
    category: "Beverages",
    translations: [
      { language: "Spanish", word: "café", phonetic: "kah-FEH" },
      { language: "French", word: "café", phonetic: "kah-FAY" },
      { language: "German", word: "Kaffee", phonetic: "kah-FEH" },
      { language: "Japanese", word: "コーヒー", phonetic: "koh-hee" },
      { language: "Mandarin", word: "咖啡", phonetic: "kah-fay" },
    ],
  },
  {
    name: "Water",
    category: "Beverages",
    translations: [
      { language: "Spanish", word: "agua", phonetic: "AH-gwah" },
      { language: "French", word: "eau", phonetic: "oh" },
      { language: "German", word: "Wasser", phonetic: "VAH-ser" },
      { language: "Japanese", word: "水", phonetic: "mee-zoo" },
      { language: "Mandarin", word: "水", phonetic: "shway" },
    ],
  },
];

export function renderGroceryTranslationsRoute(container) {
  const cards = groceryItems
    .map(
      (item) => `
        <article class="grocery-card">
          <div class="grocery-card__header">
            <div>
              <p class="grocery-card__category">${item.category}</p>
              <h2>${item.name}</h2>
            </div>
            <span class="grocery-card__count">${item.translations.length} languages</span>
          </div>
          <div class="grocery-translation-list" role="list" aria-label="${item.name} translations">
            ${item.translations
              .map(
                (translation) => `
                  <div class="grocery-translation" role="listitem">
                    <p class="grocery-translation__language">${translation.language}</p>
                    <p class="grocery-translation__word">${translation.word}</p>
                    <p class="grocery-translation__phonetic">Phonetic: ${translation.phonetic}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

  container.innerHTML = `
    <p class="hero-label">Grocery words</p>
    <h1 class="hero-title">Grocery store items with translations and phonetics</h1>
    <p class="hero-subtitle">
      A quick study page with common store items and easy pronunciation guides in Spanish, French, German, Japanese, and Mandarin.
    </p>
    <section class="grocery-page-intro" aria-label="About this page">
      <p>Use this list to practice everyday shopping vocabulary across several languages.</p>
      <p>The phonetic spellings are simple English-friendly approximations for quick speaking practice.</p>
    </section>
    <section class="grocery-grid" aria-label="Grocery vocabulary cards">
      ${cards}
    </section>
    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
    </div>
  `;
}
