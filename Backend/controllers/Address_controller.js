const User = require('../models/User');

class AddressController {
  // Add new address
  static async addAddress(req, res) {
    try {
      const { houseNo, street, city, district, pinCode, isDefault } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If this is set as default, remove default from other addresses
      if (isDefault) {
        user.addresses.forEach(address => {
          address.isDefault = false;
        });
      }

      // If this is the first address, make it default
      const isFirstAddress = user.addresses.length === 0;

      const newAddress = {
        houseNo,
        street,
        city,
        district,
        pinCode,
        isDefault: isDefault || isFirstAddress
      };

      user.addresses.push(newAddress);
      await user.save();

      const addedAddress = user.addresses[user.addresses.length - 1];

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: addedAddress
      });

    } catch (error) {
      console.error('Add address error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add address'
      });
    }
  }

  // Get all addresses for user
  static async getAddresses(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('addresses');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: user.addresses
      });

    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve addresses'
      });
    }
  }

  // Get specific address by ID
  static async getAddressById(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const address = user.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      res.json({
        success: true,
        message: 'Address retrieved successfully',
        data: address
      });

    } catch (error) {
      console.error('Get address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve address'
      });
    }
  }

  // Update address
  static async updateAddress(req, res) {
    try {
      const { addressId } = req.params;
      const { houseNo, street, city, district, pinCode, isDefault } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const address = user.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // If setting as default, remove default from other addresses
      if (isDefault) {
        user.addresses.forEach(addr => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      // Update address fields
      if (houseNo !== undefined) address.houseNo = houseNo;
      if (street !== undefined) address.street = street;
      if (city !== undefined) address.city = city;
      if (district !== undefined) address.district = district;
      if (pinCode !== undefined) address.pinCode = pinCode;
      if (isDefault !== undefined) address.isDefault = isDefault;

      await user.save();

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: address
      });

    } catch (error) {
      console.error('Update address error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update address'
      });
    }
  }

  // Delete address
  static async deleteAddress(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      const addressToDelete = user.addresses[addressIndex];
      const wasDefault = addressToDelete.isDefault;

      // Remove the address
      user.addresses.splice(addressIndex, 1);

      // If deleted address was default and there are other addresses, make the first one default
      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });

    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address'
      });
    }
  }

  // Set default address
  static async setDefaultAddress(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const address = user.addresses.id(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // Remove default from all addresses
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });

      // Set the selected address as default
      address.isDefault = true;

      await user.save();

      res.json({
        success: true,
        message: 'Default address updated successfully',
        data: address
      });

    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default address'
      });
    }
  }

  // Get default address
  static async getDefaultAddress(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('addresses');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const defaultAddress = user.addresses.find(address => address.isDefault);

      if (!defaultAddress) {
        return res.status(404).json({
          success: false,
          message: 'No default address found'
        });
      }

      res.json({
        success: true,
        message: 'Default address retrieved successfully',
        data: defaultAddress
      });

    } catch (error) {
      console.error('Get default address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve default address'
      });
    }
  }
}

module.exports = AddressController;
