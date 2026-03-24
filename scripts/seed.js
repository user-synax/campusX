
const mongoose = require('mongoose');
const connectDB = require('../lib/db');
const ShopItem = require('../models/ShopItem');
const newItems = require('../lib/newShopItems');

const seedDB = async () => {
    await connectDB();

    // Your pricing logic
    const getPrice = (category, rarity) => {
        const basePrices = {
            avatar_frame: 50,
            post_badge: 75,
            bio_theme: 80,
            username_color: 100,
            chat_bubble: 120,
            profile_banner: 150,
            profile_theme: 180,
            special_badge: 200,
            effect: 250,
            entry_effect: 300
        };

        const rarityMultipliers = {
            common: 1,
            uncommon: 1.5,
            rare: 2.5,
            epic: 5,
            legendary: 10,
            mythic: 20
        };

        const basePrice = basePrices[category] || 0;
        const multiplier = rarityMultipliers[rarity] || 1;

        return basePrice * multiplier;
    };

    const itemsWithPrices = newItems.map(item => ({
        ...item,
        price: getPrice(item.category, item.rarity)
    }));

    try {
        await ShopItem.insertMany(itemsWithPrices, { ordered: false });
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }

    mongoose.connection.close();
};

seedDB();
