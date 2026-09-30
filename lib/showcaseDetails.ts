// AIM-supplied profile details from the participant tracker Google Sheet
// (Jack Towers, 2026-09-30). Keyed by `${program}:${match}` from the roster.
// These override feed descriptions and links on the showcase page.

export interface ProfileDetails {
  story?: string;
  sells?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

export const DETAILS: Record<string, ProfileDetails> = {
  "maf:maldoni": {
    "story": "MalDoni's Cafe, owned by Alicia Waters. One bite—that’s all it takes to fall for the food at MalDoni's. “This who we are,” says owner Alicia. The Oakland-based chef turned a personal outlet into a business. It’s every bit the definition of soul food. Alicia loves feeding people, and it’s clear in her warm and welcoming personality. This is a family affair for her. MalDoni’s got its start in Mandela Partners Entrepreneur Incubation Program. With that foundational support, they were able to expand into AIM’s Market Access Fund. These two complementary programs support BIPOC-owned food businesses with direct financial and resource support.",
    "sells": "Southern BBQ",
    "instagram": "https://www.instagram.com/maldonis_cafe"
  },
  "maf:salvirican": {
    "story": "Carlos Salgado, born and raised in Puerto Rico, and his wife Linda, originally from El Salvador, co‑founded Salviricans. They specialize in authentic Salvadoran cuisine centered on handcrafted pupusas prepared with a signature sofrito. Based in Fremont, they’re a regular part of our Newark and Grand Lake farmers markets. They also cater and do special events. They used their cash stipend to acquire a new van to expand their operations. We’re grateful to be able to provide the opportunity to grow and strengthen local food systems.",
    "sells": "Pupusas, Salvadoran Quesadillas",
    "website": "https://www.salviricans.com",
    "instagram": "https://www.instagram.com/salviricans",
    "facebook": "https://www.facebook.com/salviricans"
  },
  "maf:luna's good": {
    "story": "Luna's was born from love and Chen wanting to give her pet the very best. She crafts clean, single-ingredient, high-quality jerky treats in small batches in Alameda, CA. She uses locally sourced, human-grade proteins. No additives. No preservatives. No fillers. Just pure, simple goodness made with care and integrity. The Market Access Fund has supported her through her rebrand. The additional financial support has been meaningful while she learns as she goes through the process.",
    "sells": "Cat and Dog Treats",
    "website": "https://www.lunasgoodcatanddogtreats.com",
    "instagram": "https://www.instagram.com/lunasgoodcatanddogtreats",
    "facebook": "https://www.facebook.com/lunasgoodcatanddogtreats"
  },
  "maf:dangerously delicious": {
    "story": "At Dangerously Delicious Desserts, everything begins with a love for baking and the joy of sharing it with others. Every cookie, cake pop, and macaron is made with care by owner Dalene Dematteis. Baking has always been her way of creating happiness, and she’s grateful to share her passion with the people around me. As a Market Access Fund recipient, she’s had a chance to invest back into herself. She’s using the grant to strengthen operations and increase market access. It’s one of the ways the Market Access Fund helps farmers markets better reflect the diversity of our food and farming communities",
    "sells": "Cakes and desserts",
    "instagram": "https://www.instagram.com/dang.erouslydeliciousdesserts",
    "facebook": "https://www.facebook.com/dangerouslydeliciousdesserts"
  },
  "maf:lion kings": {
    "story": "Lion Kings is owned by James Hong and specializes in sushi bake bowls. As one of our 2026 Market Access Fund recipients, they’re sharing their own unique culture with our lucky Stonestown Farmers Market shoppers. Their house-made sauces really set their sushi bakes apart from anything you’ve had before. For them, the fund has provided an option to better operations and lessen the financial burden of the daily fees, providing a runway of growth.",
    "sells": "Sushi bakes",
    "instagram": "https://www.instagram.com/lionkingssfsushibake"
  },
  "maf:yi lemon": {
    "story": "Yi Lemon & Yi Mian, owned by Minyi Liu. Minyi specializes in handmade cold noodles and fresh crushed lemon tea. Her authentic Changsha street flavors hit every part of your palate—sweet, savory, spicy, and refreshing. It’s a taste of Hunan right at the Newark Farmers Market! What started as a way to share the taste of home has grown into a small business she cares about deeply. As a Market Access Fund participant, Minyi is hoping to use the grant to improve efficiency on busy market days. She loves seeing customers enjoy her food, and is hoping to reach more people who are discovering her flavors for the first time.",
    "sells": "Cold noodles and lemon tea"
  },
  "maf:blooming maria": {
    "story": "Blooming Maria's, a flower farm operating out of Pescadero owned by Maria Zavala. A family-powered team, through Blooming Maria's, family and employees have brought their shared vision to life through hard work. They farm with respect for the land, using organic practices, crop rotation, and cover crops to nurture healthy soil and beautiful blooms. The Market Access Fund has helped them grow. New banners and canopies have provided an upgraded market experience for their existing customers as well as attracting new ones. Every day spent among the flowers is a gift—and they're so happy to share it with you at the farmer's market.",
    "sells": "Cut flowers, floral arrangements, wreaths",
    "website": "https://www.bloomingmarias.com",
    "instagram": "https://www.instagram.com/bloomingmarias"
  },
  "maf:leafy veda": {
    "story": "Leafy Veda, founded by Nirali Maru and Vraj Patel, was created to connect people with nutrient-dense nourishment grown locally and mindfully. They grow premium microgreens, edible flowers, and create plant-based wellness products. They grow using sustainable practices that prioritize soil health, minimal waste, and natural pesticide-free production. Their market presence is deeply education driven. With support from the AIM Market Access Fund, LeafyVeda invested in eco-conscious packaging, strengthened production practices, and custom small-scale automation. Elevating their efficiency and sustainability has allowed them to grow responsibly and bring fresh, plant-powered nourishment to more families.",
    "sells": "Microgreens",
    "instagram": "https://www.instagram.com/leafyveda"
  },
  "maf:nobunaga": {
    "story": "Sayaka Tani, owner of Nobunaga's Blue Ribbon, a premium popcorn brand based in Napa Valley. Her popcorn is air-popped and seasoned in small batches with the best ingredients. Born and raised in Japan, she moved to the U.S. on her own in 2003. Her upbringing influenced her brand's best-known flavor, a savory and sweet Japanese Curry. They continue to innovate with new favorites like Cheddar & Chives, Alfredo, and Apple Butter. With support from AIM’s Market Access Fund, Nobunaga’s Blue Ribbon will reinvest in business growth. The goal is to keep building a stable small business that brings connection and cultural exchange to the farmers' market community.",
    "sells": "Popcorn, seasonings",
    "website": "https://www.nobunagasblueribbon.com",
    "instagram": "https://www.instagram.com/nobunagas_blueribbon",
    "facebook": "https://www.facebook.com/nobunagasblueribbon"
  },
  "maf:snoring orange": {
    "story": "Vineeta Chand is a stained-glass mosaic artist based out of west Berkeley. Snoring Orange Studio focuses on the native California landscape across seasons, terrains and weather, and native flora and fauna inhabiting these spaces. Receiving the Market Access Fund grant was a huge relief for Vineeta. Finances can be scary as an artist, and knowing she had a slight cushion took the weight off of her shoulders.",
    "sells": "Stained glass mosaics",
    "website": "http://www.snoringorangestudio.com",
    "instagram": "https://www.instagram.com/snoringorangestudio"
  },
  "farmer:dulce organic": {
    "story": "Dulce Organic Farms is a 23 acre organic berry farm owned by Antonia Vega Gonzales, based in Watsonville, CA. Alongside her husband, Jose Juan Pulido Garcia, they bring decades of experience farming in California.\n\nRaised by farmers, Antonia has been working since she was a young girl and has now grown to own her own 23-acre farm, where she produces strawberries, blueberries, red mulberry, and peas. Through the Incubator Booth program, Dulce Organic Farms hopes to expand its direct-to-consumer sales and expand their reach into AIM's markets.",
    "sells": "Blueberries, raspberries, strawberries",
    "instagram": "https://www.instagram.com/dulcefarms"
  },
  "farmer:tierra de esperanza": {
    "story": "Maria, a third-year ALBA farmer originally from Oaxaca, Mexico, is the founder of Tierra de Esperanza Organic Farm. With more than 20 years of experience working in agriculture in California and a farming tradition passed down from her parents and grandparents, Maria and her family made their dream of owning a farm a reality by starting their organic vegetable farm.\n\nToday, their farm supplies fresh organic vegetables to supermarkets, farmers' markets, and wholesale distributors. Maria and her family are committed to growing healthy produce and providing fresh food to their community.",
    "sells": "Broccolini, celeriac, cilantro, green beans, jalapenos, kale, onions, strawberries, tomatoes, zucchini"
  },
  "farmer:monarca": {
    "story": "Luis was born and raised in Mexico, where he grew up on a ranch. From a young age, agriculture was part of his daily life. When Luis came to the United States, he first worked as a construction worker, then attended Hartnell College and became involved with ALBA.\n\nThe name of his farm reflects both his background and his vision: “Monarca” represents a part of where he comes from, while “Berry” represents the crops he hopes to focus on. Luis wants to share a simple message: if you want to work in agriculture, you have to stay committed, work hard, and believe in your goals.",
    "sells": "Broccolini, carrots, celery, cherry tomatoes, cilantro, green beans, lettuce, onions, parsley, peas, peppers, strawberries, tomatillos, tomatoes, zucchini",
    "facebook": "https://www.facebook.com/monarcaberryfarms"
  },
  "farmer:products from paradise": {
    "story": "Products From Paradise is a family-owned farming business located in the Central Valley of California that specializes in growing cactus along with other fresh fruits and vegetables. The farm's goal is to be organic and sustainable, using natural methods to protect the soil, water, and biodiversity.\n\nThe family is looking to introduce cactus to a broader audience and educate customers about its benefits, and eventually to create a one-of-a-kind agritourism experience in the Central Valley.",
    "sells": "Nopal, tomatillos"
  },
  "farmer:avina": {
    "story": "Aviña Organic Farms is owned by Martin Aviña Hernandez, whose roots in farming trace back to his family in Mexico, who grew wheat and corn. Martin has been working in farms in California for over a decade with support from the Agriculture and Land-Based Training Association (ALBA). Martín grows a wide variety of crops on 12 acres including broccoli, chard, zucchini, fennel, and lettuce.\n\nHe actively prioritizes knowledge-sharing and mentorship with other farmers. As he works to increase his acreage, Martín hopes to hire more farmworkers and staff and, ultimately, model what farm ownership can look like for them too.",
    "sells": "Beets, blackberries, bok choy, broccoli, raspberries, cabbage, celery, cut flowers, fennel, kale, lettuce, onions, peas, strawberries, swiss chard, zucchini",
    "facebook": "https://www.facebook.com/avinaorganicfarms"
  },
  "farmer:e&n organic": {
    "story": "E&N Organic Farms is a small-scale organic mixed vegetable farm based out of Salinas. Owned by Eduardo Medrano, E&N grows a variety of crops, including broccolini, carrots, tomatoes, cilantro, lettuce, onions, peas, peppers, strawberries, and Swiss chard. Originally from the state of Michoacán, Eduardo has worked in agriculture for practically his entire life. He is a proponent of organic agriculture, believing that it is an important part of eating healthier, taking care of the land and environment, and bringing healthier food into people's homes.",
    "sells": "Broccolini, carrots, cherry tomatoes, cilantro, lettuce, onions, peas, pepperettes, strawberries, swiss chard"
  },
  "maf:ayoquezco": {
    "story": "Alberto Mendoza grows organic produce. He is in the farmers market because he likes to grow different kinds of vegetables like carrots, peas, and celery. He likes organic farming because it is healthier for children, young people and adults - for everyone! He has four kids and it is important for him that they eat organic vegetables for their health - he hopes that every child has the opportunity to eat healthy organic food.",
    "sells": "Artichokes, basil, beets, black raspberries, broccoli, broccolini, raspberries, cabbage, carrots, cauliflower, celery, chiles, corn, cut flowers, dill, eggplant, green beans, leeks, lettuce, mint, onions, papalo, parsley, peas, purslane, squash, strawberries, swiss chard, tomatillos, tomatoes, tropical plants/flowers, zucchini"
  },
  "maf:boss seasoning": {
    "story": "W2C Group created Boss Seasoning to bottle and sell specially blended spice and herbs. They currently have 2 - The original spice blend, created by Ken Wheeler and the mexican gourmet blend created by Michael Cutliff.",
    "sells": "Spice mixes"
  },
  "maf:herbal alchemist": {
    "story": "The Herbal Alchemist is a natural skincare company that is working to break down the barriers of accessibility in the self-care industry by creating affordable, high quality, and plant-powered products.  Their products are created for the busy and health-conscious minimalists who are looking for simplicity. They are meeting their customers where they're at by crafting versatile, high-quality products that rely on the power of plants to improve skin's health and natural radiance - priced for real people!",
    "sells": "Natural skincare"
  },
  "maf:induchucuiti": {
    "story": "Induchucuiti Organic Farm is a representation of Celsa's parents for living in agriculture and loving nature, it gives her great joy to grow organic and return to her ancestors and show her children how wonderful our land and nature is, and also show her community that they can start a business with the knowledge they have and be inspired by the insect pests seasons of the year that can show us how to live a better life.",
    "sells": "Beets, bell peppers, broccoli, carrots, celery, cherry tomatoes, cilantro, corn, cucumbers, green beans, jalapenos, kale, lemons, lettuce, mandarins, onions, parsley, radishes, squash, strawberries, swiss chard, tomatillos, tomatoes"
  },
  "maf:mixteco": {
    "story": "Baltazar was born in Oaxaca and his parents used to have a bit of a garden they planted and ate what they grew but when he came here he was a farm worker in the strawberry and his dream was to have a house for his parents and give back. They used to always love him and always give him something to eat even they had no money so he started this company and his parents are not working anymore he retired them. Customers might see them around the farmers market.",
    "sells": "Basil, broccoli, broccolini, cabbage, carrots, cauliflower, celery, fava beans, kale, onions, peppers, swiss chard, tomatoes, zucchini"
  },
  "maf:seasonal sweet": {
    "story": "Seasonalsweetss is a unique snack cart catering business that offers a variety of seasonal treats tailored to each time of year. From refreshing summer snacks to cozy winter delights, their offerings change with the seasons, ensuring a fresh and exciting menu year-round. In addition to delicious seasonal snacks, they serve iced lattes, providing the perfect pairing for every occasion. Whether you're at a local event, festival, or looking for a quick snack on-the-go, Seasonalsweetss brings the flavors of the season directly to you.",
    "sells": "Pancakes"
  },
  "maf:sip to live": {
    "story": "Looseleaf tea blends inspired by the Moroccan tradition of tea and the Indian tradition of Ayurvedic herbalism",
    "sells": "Tea blends",
    "website": "https://www.siptolive.com",
    "instagram": "https://www.instagram.com/sip.to.live"
  },
  "maf:tavus": {
    "story": "Tavus Foods is a Woman Founded Persian American Food Brand. They specialize in Spreadable Dips and snacks.  It is their mission to preserve the ancient flavors of Persia and its traditions. They like to think of themselves as introducing a new food category to the market.  What makes their dips so different are the unique colors and flavors inspired by Debb's grandmother's cooking. The Spreadable dips aren't only nutrient-packed but vibrant and fun to eat. Kids love them! These dips have a Chef's kiss on them and have been years in the making.",
    "sells": "Persian dips"
  },
  "maf:zarate": {
    "story": "Zarate is a family farm located in West Marin County, CA. They grow a variety of fruits, vegetables, and herbs. Everything is hand picked, fresh and packed.",
    "sells": "Bell peppers, broccoli, cabbage, calendula, carrots, cauliflower, celery, chicory, cilantro, cucumbers, dill, endive, escarole, fennel, garlic, hot peppers, kale, leeks, lettuce, melons, mint, mustard greens, onions, parsley, pea shoots, radicchio, radishes, rosemary, spinach, squash, stinging nettles, swiss chard, syrups, tomatillos, tomatoes, turnips",
    "instagram": "https://www.instagram.com/zaratefamilyfarm"
  },
  "maf:8 am fashion": {
    "story": "Bespoke Atelier,  hand crafting in Oakland CA from well selected fabrics.",
    "sells": "Handmade shirts, dresses, jackets",
    "website": "https://www.etsy.com/shop/8amfashion",
    "instagram": "https://www.instagram.com/shop8amfashion",
    "facebook": "https://www.facebook.com/meazastyle"
  },
  "maf:baby and boy": {
    "story": "Baby and Boy Pastries produces fresh artisan baked goods featuring classic and Asian flavors.",
    "sells": "Artisan baked goods",
    "instagram": "https://www.instagram.com/babyandboypastries"
  },
  "maf:dre's jams": {
    "story": "Dre's Jams and Jellies is a Cottage Food Organization (CFO) business. They make homemade jams and jellies and other items that are on the California CFO approved list. They have a Alameda County Department of Environmental Health permit to operate.",
    "sells": "Jams and jellies"
  },
  "maf:goldi's": {
    "story": "Goldi’s Gourmet Spices, established in 2017, is a herb and spice business dedicated to providing superior products at a reasonable price, helping enhance cooking skills, and delivering exceptional customer service.",
    "sells": "Seasonings, herb and spice blends",
    "website": "https://www.goldisgourmetspices.com",
    "instagram": "https://www.instagram.com/goldisgourmetspices",
    "facebook": "https://www.facebook.com/goldisgourmetspices"
  },
  "maf:kinoko": {
    "story": "Kinoko creates authentic Japanese home cooking dishes and sweets with a bit of modern twist to it.",
    "sells": "Japanese hot food"
  },
  "maf:meera's": {
    "story": "Welcome to the delicious world of Meera's Sweet Delights! They are pleased that you chose to visit their online store to find out more about them. Their mission is to take best of international pastry and bakery traditions and combine them in innovative new ways to create the finest, most indulgent foods you have ever tasted.",
    "sells": "Vegan and gluten-free South Asian desserts"
  },
  "maf:nadia's desserts": {
    "story": "Nadia’s Dessert LLC is a small bakery in northern California focusing in creating delicious cookies, breads, brownies, and more. They offer Gluten Free, Dairy Free and Sugar Free options and they use organic and healthy ingredients to create delicious and intense flavors, carefully made to bring quality and flavor to all their clients.",
    "sells": "Desserts and pastries"
  },
  "maf:weekend store": {
    "story": "The Weekend Store makes personal and home accessories featuring mid-20th century vintage maps, feminist and pop culture icons.",
    "sells": "Prints, note cards, napkins, tea towels, tote bags, accessories",
    "website": "https://www.theweekendstore.com",
    "instagram": "https://www.instagram.com/theweekendstore",
    "facebook": "https://www.facebook.com/theweekendstorevintage"
  },
  "maf:yeso coconut": {
    "story": "Yeso Coconut Jelly's mission is to bring the freshness to their customers, let all their customers enjoy their different flavors of coconut jelly, and connect everyone in the community by bringing the coconut lovers all together.",
    "sells": "Coconut jellies"
  },
  "maf:little moon": {
    "story": "The vision for Little Moon Bakehouse is to capture the magic of traditional Asian bakeries in an eco-conscious way. Here's to creating the best future for us all, one food memory at a time.",
    "sells": "Asian pastries"
  },
  "maf:forest & flour": {
    "story": "Forest & Flour is an earth and community conscious kitchen that offers delicious wholesome food that is free of gluten, dairy, soy, corn, peanut, and potato starch. They make food that is safe and healthy, sourced from local food growers, for you to enjoy so you can be your best and focus on the things you love!",
    "sells": "Gluten free pastries and baked goods",
    "website": "https://www.forestandflour.com",
    "instagram": "https://www.instagram.com/forestandflour",
    "facebook": "https://www.facebook.com/forestandflour"
  },
  "maf:gigi's one": {
    "story": "Gigi's started back in 2020 with a vision of offering a delicious, sweet and unique dessert. Her love for baking started when she was little. She was raised by a very good cook, her mom! As she got older, she realized she love creating delicious food and seeing others enjoy it too! So with that, she attended the Culinary Institute of America in Saint Helena and graduated with an associated degree in Culinary Arts. She worked in multiple catering companies and restaurants to gain experience but she knew she wanted to do her own thing. Then came Gigi's! Farmers markets were always the dream of hers and thankfully Gigi's is in a couple of them in the Bay Area. She is super grateful for all of the support thus far. She cannot wait to see what the future holds for Gigi's.",
    "sells": "Doughnuts, cookies, coffee"
  },
  "maf:golden morsels": {
    "story": "Big cookies. Small bites. Golden smiles.",
    "sells": "Specialty cookies",
    "instagram": "https://www.instagram.com/goldenmorsels"
  },
  "maf:josephine's southern": {
    "story": "Josephine Southern Cuisine serves up classic Southern comfort food made with love and tradition. From crispy fried chicken to buttery cornbread and slow-cooked greens, they bring the rich flavors of the South to every plate. Whether it’s dine-in, takeout, or catering, they deliver soulful meals that feel like home.",
    "sells": "Soul food"
  },
  "maf:mimbo": {},
  "maf:modern shibori": {
    "story": "Every Marree product is designed with your sustainable life and style in mind. From color-mixing botanical dyes to cutting the perfect curve around a pocket, each design decision they make is another step towards a beautiful, smart and durable product for you. Each garment carries its own creation story, ready to be part of your greatest adventures.",
    "sells": "Dyed clothing"
  },
  "maf:mossed": {
    "story": "Mossed Juicery is a minority-owned Marin County-based cold-pressed juice & smoothie company. They're simplifying time and energy by juicing for you. Their juices have 0 added sugar and are made with whole local fruit and spice blends. They make their juices tasty and refreshing; even kids can enjoy them. They Juice for you!",
    "sells": "Sea moss juices",
    "website": "https://www.mossedjuicery.com",
    "instagram": "https://www.instagram.com/mossedjuicery",
    "facebook": "https://www.facebook.com/mossedjuicery"
  },
  "maf:nuttea": {
    "story": "Female AAPI Owned. Small Batch. Stone Ground. Organic nut butter with a twist.",
    "sells": "Nut butters"
  },
  "maf:solorio": {
    "story": "Solorio's Organic Farm is a small organic farm growing quality berries and vegetables and a large variety of cherry and heirloom tomatoes.",
    "sells": "Artichokes, basil, beets, bell peppers, blackberries, bok choy, broccoli, broccolini, carrots, cauliflower, celery, cherry tomatoes, cilantro, collards, cucumbers, cut flowers, dandelion greens, dill, eggplant, fennel, figs, green beans, hot peppers, kale, leeks, lettuce, marjoram, okra, onions, oregano, peas, potatoes, purslane, radicchio, radishes, raspberries, rhubarb, rosemary, spinach, squash, strawberries, sunflowers, swiss chard, thyme, tomatillo, tomatoes, turnips, watermelon, zucchini",
    "website": "https://www.soloriosorganic.com",
    "instagram": "https://www.instagram.com/soloriosorganicfarm"
  },
  "maf:sweet tey": {
    "story": "Sweet Tey's Pastries was created from a passion for sharing homemade Southern desserts that bring family and friends together. Every pie, cake, cobbler, pastry and cup of Love Me Tea is handcrafted with care using recipes inspired by tradition. Whether you're celebrating a birthday, wedding, holiday, baby shower, or simply treating yourself, they hope every bite reminds you of home.",
    "sells": "Cakes and cupcakes"
  },
  "maf:tha mf": {
    "story": "Bria Hutson is founder of Tha MF'n Vegan, a bold, Black woman-owned food company proving that eating MF'n plants is powerful, flavorful, and deeply healing. She is on a mission to improve our food systems to be inclusive for people with food sensitivities and allergies, as well as creating solutions for communities that have historically been underserved and misrepresented.",
    "sells": "Jackfruit and vegan products"
  },
  "maf:chestnut street": {
    "story": "High quality artisan granola inspired by flavors enjoyed around the world. Chestnut Street Granola is Granola from the Town, Made for the Globe.",
    "sells": "Granola, granola bars, trail mix",
    "website": "https://www.chestnutstreetgranola.com",
    "instagram": "https://www.instagram.com/chestnutst.granola"
  },
  "maf:dragonspunk": {
    "story": "Dragonspunk focuses on “healing the land” in a heavily polluted industrial area. Using Korean Natural Farming and mycoremediation (fungi-based healing), Powell works to transform toxic “dirt” into life-sustaining “soil.” Powell aims to bridge the gap between grassroots “citizen science” and academic institutions. His goal is to use data to prove that nature-based remediation works, creating a scalable model that can be applied to other polluted “brownfields” across the country. The work is a form of “mycelial” community building — interconnected, restorative, and rooted in the belief that healthy soil is the foundation for a healthy community. Powell’s journey began with a commitment to volunteerism and service, which led him from a homeless shelter to stewarding land atop a Caltrain tunnel and building deep roots with local neighborhood elders."
  },
  "maf:lemonade bar": {
    "story": "The Lemonade Bar specializes in fresh squeezed lemonade and organic handcrafted frozen lemonades. They work out of the Oakland-San Francisco Bay Area. Their creative team loves to create many new flavors to excite your palate. You can find them at farmers markets, weddings, graduations, parties and more. They pride themselves on using organic locally sourced ingredients from farmers within their community.",
    "sells": "Lemonade"
  },
  "maf:mac'd with love": {
    "story": "Roselle started Mac’d with Love in 2020 during the peak of the pandemic. What started as a way to pass time during lockdown became an opportunity to launch a small business. It wasn’t long before Roselle’s sweet treats began to gain attention online and she realized her passion could become more than a hobby. She began looking into getting licensed and started reaching out to different farmer’s markets in the Bay Area. After many phone calls and a few dead ends, Mac’d with Love finally made its way to the market and began selling Roselle’s cute and colorful creations.",
    "sells": "Macarons"
  },
  "maf:pound bizness": {
    "story": "At Pound Bizness, pound cake is a timeless dessert that serves as a powerful way to connect friends and family one slice at a time. With a recipe rooted in southern tradition, they honor Aunt Ira’s classic pound cake while adding community-favorite flavors. Now, go on and indulge in the sweet taste of memories and good times",
    "sells": "Pound cakes",
    "website": "https://www.poundbizness.com",
    "instagram": "https://www.instagram.com/poundbizness",
    "facebook": "https://www.facebook.com/poundbizness.com"
  },
  "maf:raised roots": {
    "story": "Raised Roots is a farming business based in Sunol Valley in Alameda County. The two-acre farm is fully operated by San Mateo native Jamil Burns. Raised Roots produced a variety of both unique and staple vegetables from okra and tomatoes to dandelion greens and chili peppers.",
    "sells": "Peppers",
    "website": "https://www.raisedroots.com",
    "instagram": "https://www.instagram.com/raisedroots"
  },
  "maf:shao shan": {
    "story": "Shao Shan Farm is a 5.5-acre certified organic farm in Bolinas, CA that focuses on growing Asian heritage varieties. Scott started this farm at 24 years old to provide a resource for high quality organic produce for Asian American chefs, community, and grocers in the Bay Area. Many Asian American farmers of his generation have experienced isolation from the lack of diversity in the sustainable food movement, and many consumers have had to sacrifice eating traditional foods to align with their environmentally and socially just sourcing ethics. Everyday he works on his farm to try and change that. Farming is a lifestyle that encompasses every minute of your day and brings immensely personal highs and lows."
  },
  "farmer:solorio": {
    "story": "Solorio's Organic Farm is a small organic farm growing quality berries and vegetables and a large variety of cherry and heirloom tomatoes.",
    "sells": "Artichokes, basil, beets, bell peppers, blackberries, bok choy, broccoli, broccolini, carrots, cauliflower, celery, cherry tomatoes, cilantro, collards, cucumbers, cut flowers, dandelion greens, dill, eggplant, fennel, figs, green beans, hot peppers, kale, leeks, lettuce, marjoram, okra, onions, oregano, peas, potatoes, purslane, radicchio, radishes, raspberries, rhubarb, rosemary, spinach, squash, strawberries, sunflowers, swiss chard, thyme, tomatillo, tomatoes, turnips, watermelon, zucchini",
    "website": "https://www.soloriosorganic.com",
    "instagram": "https://www.instagram.com/soloriosorganicfarm"
  },
  "farmer:coronel": {
    "story": "Adelio Coronel is starting a small company specializing in certified organic vegetables. He wants to be part of this great movement, producing healthy food.",
    "sells": "Bok Choy, Broccoli, Broccolini (Broccoletti/Broccolette), Celery, Cilantro, Corn, Dill, Fava Beans, Fennel, Green Onions, Kale, Lettuces, Onions, Parsley, Peas (Fresh), Squash, Strawberries, Tomatoes"
  },
  "farmer:oaxax": {
    "story": "Oaxax is a family owned business that doesn'tuse any pesticides to produce a variety of produce items for sale at the farmers market.",
    "sells": "Beets, bok choy, broccoli, broccolini, cabbage, carrots, cauliflower, fava beans, strawberries"
  },
  "farmer:luna dorado": {
    "story": "On just one acre of land in San Juan Bautista, Lupita grows chard, lettuce, kale, marigolds and carrots, as well as broccolini, red cabbage, Napa cabbage and strawberries, depending on the season. “A little bit of everything,” she says.",
    "sells": "Artichokes, Basil, Beets, Bell Peppers, Broccoli, Broccolini (Broccoletti/Broccolette), Cabbage, Carrots, Cauliflower, Chard, Chiles, Collards, Cover Crop, Cucumbers, Dill, Eggplant, Elderberries, Epazote, Fennel, Flowers, Garlic, Green Beans, Kale, Lettuces, Mint, Onions, Peas (Fresh), Potatoes, Sage, Strawberries, Tomatoes, Zucchini"
  },
  "farmer:narci": {
    "story": "Narci Organic Farms is a family business run by Maria and her two daughters, Yesenia and Angelica. Offering fresh organic fruits and vegetables.",
    "sells": "Raspberries, row crops, and more."
  },
  "farmer:tikal": {
    "story": "Fernando Rodas Pedro of Tikal Organic Farm sells a wide selection of organic produce.",
    "sells": "Peppers, tomatoes, kale, swiss chard, squash, green beans, strawberries, cauliflower, romanesco"
  },
  "farmer:anna's organic": {
    "story": "Anna’s Organic Farms strives to provide the best quality organic vegetables. They are a small family-run operation that is following on farming traditions from their past generations.",
    "sells": "Cabbage, kale, peppers, lettuce, squash, radishes"
  },
  "farmer:mimi's organic": {
    "story": "Mimi's Organic Farms is proudly woman-owned and operated by Domitila Tapia and her daughter Marlen Tapia. Despite starting her company in 2015, Domitila Tapia brings with her many years of experience in the agriculture field. Her passion for organic farming is evident in every aspect of her work. Domitila is deeply committed to growing organically, focusing on cultivating Organic Blackberries and organic Strawberries on her 20-acre farm in the Salinas Valley. She believes in the importance of sustainable and environmentally friendly practices in agriculture. Domitila utilizes natural remedies to combat pests and mites that can potentially harm the growth of her fruit, ensuring that her produce is not only organic but also grown in a way that respects the ecosystem.",
    "sells": "Blackberries, Mixed Vegetables, Strawberries"
  },
  "farmer:ayoquezco": {
    "story": "Alberto Mendoza grows organic produce. He is in the farmers market because he likes to grow different kinds of vegetables like carrots, peas, and celery. He likes organic farming because it is healthier for children, young people and adults - for everyone! He has four kids and it is important for him that they eat organic vegetables for their health - he hopes that every child has the opportunity to eat healthy organic food.",
    "sells": "Artichokes, basil, beets, black raspberries, broccoli, broccolini, raspberries, cabbage, carrots, cauliflower, celery, chiles, corn, cut flowers, dill, eggplant, green beans, leeks, lettuce, mint, onions, papalo, parsley, peas, purslane, squash, strawberries, swiss chard, tomatillos, tomatoes, tropical plants/flowers, zucchini"
  },
  "farmer:royally grown": {
    "story": "Mother and son duo, Elda and Abraham Garcia, have worked hard to resiliently overcome adversity from field workers to becoming Hispanic-owned organic certified farm owners. During the pandemic, Royally Grown tremendously helped and provided farm fresh foods to those who needed it most as part of the emergency food relief program. Turning pain to purpose, they continue to inspire and thrive as a small farm for the community. \n\nFocusing on growing a mix variety of organic vegetables and berries such as strawberries, raspberries, kale, broccoli, fennel, heirloom tomatoes, bell peppers, lettuces, fresh peas, and green beans.",
    "sells": "Strawberries, raspberries, kale, broccoli, fennel, heirloom tomatoes, bell peppers, lettuces, fresh peas, and green beans."
  },
  "farmer:coyo": {
    "story": "Organic farmer, mainly focused on vegetables/row crops. Carlos Daniel has been in the farming business for six years and his farm is located in Soledad.",
    "sells": "Beets, bok choy, broccolini, carrots, celery, chiles, cilantro, dill, green beans, kale, lettuce, onions, parsley, peas, radishes, sweet potatoes, swiss chard, tomatoes, zucchini",
    "website": "https://www.coyoteslim.com"
  },
  "farmer:salazar organic": {
    "story": "Salazar Organic Farms is a family-owned farm in Watsonville, CA, dedicated to sustainable organic agriculture and community education. Founded in 2019, the farm specializes in organic produce and has been actively involved in conservation initiatives, partnering with local organizations to enhance soil health and water efficiency. Through the California Farm to School Incubator Grant Program, the farm is expanding its impact by promoting sustainable farming practices and hands-on learning experiences.",
    "sells": "Strawberries"
  },
  "farmer:vasquez organic": {
    "story": "Vasquez Organic Farm is a small family farm owned and operated by Emiliano Gomez Vasquez and his family. Emiliano learned to farm as a child in Oaxaca, Mexico by his father and mother who would farm food to feed their family. Here he learned of natural ways to cultivate crops using nature as their tools. Once Emiliano came to the Central Coast, he learned to farm crops grown in Northern California while working as a farm worker at a local farm. To follow his dream of buying a house and some land to call his own, Emiliano and his family opened Vasquez Organic Farms in Hollister, CA. With a couple of acres, Emiliano started cultivating different fruits and vegetables year-round while rotating for crop diversity, planting flowers in between beds for beneficial organisms, and conserving water using drip systems and care. The Family Farm located in Hollister, and specializes in vegetables such as Cherry tomatoes, Sungold, sweet 100, Etc. They also have other vegetables such as red kale, green kale, and Chard. They also have nine different varieties of chili peppers.",
    "sells": "Beets, bell peppers, broccoli, cabbage, cherry tomatoes, corn, cucumbers, hot peppers, kale, onions, papalo, peas, squash, swiss chard, tomatillos, tomatoes, watermelon"
  },
  "farmer:induchucuiti": {
    "story": "Induchucuiti Organic Farm is a representation of Celsa's parents for living in agriculture and loving nature, it gives her great joy to grow organic and return to her ancestors and show her children how wonderful our land and nature is, and also show her community that they can start a business with the knowledge they have and be inspired by the insect pests seasons of the year that can show us how to live a better life.",
    "sells": "Beets, bell peppers, broccoli, carrots, celery, cherry tomatoes, cilantro, corn, cucumbers, green beans, jalapenos, kale, lemons, lettuce, mandarins, onions, parsley, radishes, squash, strawberries, swiss chard, tomatillos, tomatoes"
  },
  "farmer:mixteco": {
    "story": "Baltazar was born in Oaxaca and his parents used to have a bit of a garden they planted and ate what they grew but when he came here he was a farm worker in the strawberry and his dream was to have a house for his parents and give back. They used to always love him and always give him something to eat even they had no money so he started this company and his parents are not working anymore he retired them. Customers might see them around the farmers market.",
    "sells": "Basil, broccoli, broccolini, cabbage, carrots, cauliflower, celery, fava beans, kale, onions, peppers, swiss chard, tomatoes, zucchini"
  },
  "farmer:imperial crops": {
    "story": "Everardo Ortiz is the owner of Imperial Crops at ALBA. Everardo began as a farmer at ALBA in 2022 and is prepping land with his family to plant Dino Kale next."
  },
  "farmer:queen of vegetables": {
    "story": "Yadira is a single mother of three boys, came to the US in 2000, in 2019 had the dream of starting her own farm business, joined ALBA in 2019, and is inspired to be a successful mother and farmer. Yadira grows a wide variety of vegetables as well as fruits such as perrsimons, oranges, tangerines, and lemons,",
    "sells": "Carrots"
  },
  "farmer:my organic farm": {
    "story": "Margarita Castro, an Otomi Indigenous woman from Hidalgo, Mexico, and a single mother of four daughters, embodies resilience and determination. Growing up on a farm, she learned the value of hard work at an early age, assisting her father in planting corn when she was just four years old. After working as a farm laborer in California’s Central Coast, Margarita pursued her dream of running her own farm.",
    "sells": "Zucchini"
  },
  "farmer:siembra": {
    "story": "Siembra y Cosecha focuses on farming a large variety of vegetables, strawberries and melons. All of their practices are sustainable and soon to become certified organic. They pride themselves in ethically providing chemical free produce to be a part of the environmental and health changes needed in today's society.",
    "sells": "Beets, broccoli, broccolini, cabbage, carrots, cauliflower, cilantro, corn, cucumbers, daikon, eggplant, fava beans, green beans, herbs, jicama, kale, lettuce, melons, peppers, radishes, strawberries, swiss chard, tomatillos, tomatoes, watermelon",
    "facebook": "https://www.facebook.com/misiembraycosecha"
  },
  "farmer:ventura organic": {
    "story": "Ventura Organics is a small family farm based out of San Benito County in San Juan Bautista. They operate 8 acres that product that spans from tomatoes and celery to zucchini and beets. They started in 2012 and have been family owned ever since.",
    "sells": "Beets, broccoli, broccolini, cabbage, carrots, cauliflower, celery, cilantro, collards, corn, cut flowers, fennel, kale, leeks, lettuce, onions, parsley, peppers, strawberries, swiss chard, tomatillos, tomatoes, zucchini",
    "instagram": "https://www.instagram.com/ventura_organic"
  },
  "farmer:angela's ranch": {
    "story": "Angela's Ranch is a small family owned business in Madera, CA. They practice in Black mission figs at AIM's Hayward, Newark, and Clement Street markets.",
    "sells": "Black mission figs"
  },
  "farmer:alfa y omega": {
    "story": "Alfa y Omega is a small-scale, organic, BIPOC and Woman-Owned farm based out of Salinas, California, offering fresh produce at AIM's markets.",
    "sells": "Broccoli, lettuce, tomatoes"
  },
  "farmer:buena vista": {
    "story": "Having been farming for four years with business remaining stable during the pandemic, Victor and Veronica remind us how our land, our seeds and our farmers are steadfast in providing for us.",
    "sells": "Basil, Bay Laurel, Cabbage, Carrots, Chard, Chervil, Chives, Cilantro, Dandelion, Dill, Leeks, Marjoram, Mint, Mixed Vegetables, Onions, Oregano, Parsley, Peas (Fresh), Purslane, Raspberries, Rosemary, Sage, Savory, Tarragon, Thyme, Tomatoes"
  },
  "farmer:la buena tierra": {
    "story": "At La Buena Tierra, they believe that you and your family deserve fresh, nourishing, and safe food. That’s why they pour their hearts into every crop, following the organic farming practices they proudly learned through the Agriculture and Land-Based Training Association. Their farm is certified organic by CCOF and USDA, ensuring the highest standards of quality and care. From their fields to your table —from Salinas, California to Santa Cruz, Monterey and Santa Clara Counties— their seasonal organic produce is harvested with love and delivered once a week. Check out their Veggie Box delivery options and enjoy the goodness of fresh, local food while supporting a Woman-Owned farm who grows with you and your family in mind!",
    "sells": "Basil, Beans, Bok Choy, Broccolini (Broccoletti/Broccolette), Carrots, Celery, Chard, Cilantro, Cucumbers, Green Beans, Kale, Lettuces, Mixed Vegetables, Onions, Parsley, Peas (Fresh), Radishes, Squash, Strawberries, Tomatoes (Cherry)"
  },
  "farmer:lopez organic": {
    "story": "Lopez Organic Farms dba Fermin Lopez is a certified USDA organic operation in Salinas, CA, certified by CCOF Certification Services, LLC",
    "sells": "Artichokes, Broccolini (Broccoletti/Broccolette), Carrots, Cauliflower, Chard, Green Beans, Kale, Mixed Vegetables, Onions, Strawberries, Zucchini"
  },
  "foodmaker:chiki": {
    "story": "Chiki's Tacos, owned by Luis and Alvaro Valle, aims to give the community the highest quality and most authentic Mexican food in San Rafael, served with passion. With support from AIM's Incubator Booth, funded by the Marin County Measure A FARE Grant, Chiki's brings delicious Mexican food to market customers.",
    "sells": "Tacos, burritos, seasonal beverages",
    "instagram": "https://www.instagram.com/chikistacos/"
  },
  "foodmaker:coaster cookies": {
    "story": "Coaster Cookies is a small-batch cookie brand founded by California native and artist Sean Stereo. Inspired by old-fashioned favorites and guided by a devotion to creativity and craftsmanship, Coaster Cookies re-imagines the classics we know and love to create moments of connection, joy, and nostalgia, bringing people back to the simple satisfaction of a really good cookie.",
    "sells": "Cookies, Cornflake Clusters",
    "instagram": "https://www.instagram.com/coastercookies"
  },
  "foodmaker:bakery 6": {
    "story": "Bakery 6 is 100% vegan and an award winning cottage home bakery that makes super yummy vegan cookies using the finest local ingredients.  Based in Marin County, Bakery 6's seasonal cookie won the Vegan Chef Challenge in Marin 2025 for Best Comfort Food.",
    "sells": "Cookies",
    "website": "https://www.bakery6.com",
    "instagram": "https://www.instagram.com/bakery6_vegan/",
    "facebook": "https://www.facebook.com/bakery6llc"
  },
  "foodmaker:sweet treat marin": {
    "story": "Handcrafted baked goods both sweet and savory, made with love and locally sourced ingredients. Bringing fresh, delicious treats to Marin County for every & any occasion!",
    "sells": "Cookies"
  },
  "foodmaker:vesoul": {
    "story": "Fully'z VeSoul Cafe offers a variety of flavors from Mississippi and local produce to bring a healthy innovative way for customers to enjoy a delicious healthy home cooked meal.  With Gluten-free,  vegetarian, and Vegan  options available. Creating generational wealth, catering to the needs of individuals, one order at a time !",
    "sells": "Soul Food",
    "instagram": "https://www.instagram.com/fullyz_vesoulcafe"
  },
  "foodmaker:suki": {
    "story": "A California yakitori stand for binchotan-grilled skewers and Japanese sides, inspired by Tokyo izakaya tradition and made with local ingredients. Nick runs the binchotan grill at every market and pop-up — find him over the fire, salt in one hand, tare in the other. Haley runs front of house and works alongside Nick on prep and plating.",
    "sells": "Japanese Yakitori, omusubi",
    "website": "https://www.marinprovisions.com"
  },
  "foodmaker:two pots": {
    "story": "Twopotsandapan is a private catering company and a food truck. They specialize in authentic down home southern soul food. Their specialties are  special dishes such as Chittlings, ox tails, red beans and rice, smothered pork chops, greens, turnip, collard and mustard greens,  barbecue ribs and chicken, smoked turkey, Cajun turkey and fried turkey. They also serve a vegan menu, all natural menu and a vegetarian menu.",
    "sells": "BBQ"
  },
  "foodmaker:sabor de tabasco": {
    "story": "El Sabor de Tabasco LLC was founded in 2024 by Algever Cordova. They service the neighborhood of Canal in San Rafael, CA at 85 Belvedere St. The purpose of the trailer is for people to enjoy fresh delicious meals and get to know about Tabasco. They would like to gain a larger clientele for others to taste our amazing food and get to know about our culture. They hope to work with event organizers as well as local business if possible. They currently offer dine-\"in\",  takeout and delivery, as well as doing catering for any event you may need.",
    "sells": "Tacos",
    "instagram": "https://www.instagram.com/elsabordetabasco",
    "facebook": "https://www.facebook.com/elsabordetabasco"
  }
};
