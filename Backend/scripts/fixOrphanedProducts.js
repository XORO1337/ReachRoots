#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { connectDualDB } = require('../db/connect');
const Product = require('../models/Product');
const User = require('../models/User');

const args = process.argv.slice(2);

const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }
  return args[index + 1];
};

const hasFlag = (flag) => args.includes(flag);

const ASSIGN_FLAG = '--assign';
const DRY_RUN_FLAG = '--dry-run';

const assignToId = getArgValue(ASSIGN_FLAG) || process.env.DEFAULT_ARTISAN_ID || null;
const dryRun = hasFlag(DRY_RUN_FLAG);

(async () => {
  try {
    await connectDualDB();

    const orphanedProducts = await Product.find({
      $or: [
        { artisanId: { $exists: false } },
        { artisanId: null }
      ]
    }).lean();

    if (!orphanedProducts.length) {
      console.log('✅ No orphaned products found. All products reference an artisan.');
      process.exit(0);
    }

    console.log(`⚠️  Found ${orphanedProducts.length} product(s) without an artisan:`);
    orphanedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product._id.toString()} :: ${product.name}`);
    });

    if (!assignToId) {
      console.log('\nProvide an artisan ID via "--assign <artisanId>" or set DEFAULT_ARTISAN_ID in the environment to automatically repair these products.');
      process.exit(1);
    }

    if (!mongoose.Types.ObjectId.isValid(assignToId)) {
      throw new Error('Provided artisan ID is not a valid ObjectId.');
    }

    const artisan = await User.findById(assignToId).select('name role');
    if (!artisan) {
      throw new Error('No user found for the provided artisan ID.');
    }

    if (artisan.role !== 'artisan') {
      throw new Error('The provided user is not an artisan.');
    }

    if (dryRun) {
      console.log(`\n📝 Dry run: ${orphanedProducts.length} product(s) would be updated to artisan ${artisan.name} (${artisan._id}).`);
      process.exit(0);
    }

    const updateResult = await Product.updateMany(
      { _id: { $in: orphanedProducts.map((product) => product._id) } },
      { $set: { artisanId: artisan._id } }
    );

    console.log(`\n✅ Updated ${updateResult.modifiedCount} product(s) to artisan ${artisan.name} (${artisan._id}).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to repair orphaned products:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
})();
