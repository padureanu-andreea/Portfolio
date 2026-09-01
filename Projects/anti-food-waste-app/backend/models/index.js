const sequelize = require('../config/db');

const User = require('./user');
const Group = require('./group');
const Tag = require('./tag');
const GroupMember = require('./groupMember');
const GroupMemberTag = require('./groupMemberTag');
const Product = require('./product');
const Claim = require('./claim');
const ProductVisibility = require('./productVisibility');

User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId',
  otherKey: 'groupId'
});

Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId',
  otherKey: 'userId'
});

GroupMember.belongsTo(User, { 
    foreignKey: 'userId' 
});

GroupMember.belongsTo(Group, { 
    foreignKey: 'groupId' 
});

User.hasMany(GroupMember, { foreignKey: 'userId' });
Group.hasMany(GroupMember, { foreignKey: 'groupId' });

Group.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerId'
});

User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'ownerId'});

GroupMemberTag.belongsTo(Group, { 
    foreignKey: 'groupId' 
});

GroupMemberTag.belongsTo(User, { 
    foreignKey: 'memberId' 
});

GroupMemberTag.belongsTo(User, { 
    foreignKey: 'createdBy', 
    as: 'creator' 
});

GroupMemberTag.belongsTo(Tag, { 
    foreignKey: 'tagId' 
});

Group.hasMany(GroupMemberTag, { foreignKey: 'groupId' });
User.hasMany(GroupMemberTag, { foreignKey: 'memberId' });
Tag.hasMany(GroupMemberTag, { foreignKey: 'tagId' });

User.hasMany(Product, { foreignKey: 'ownerId' });

Product.belongsTo(User, { 
    foreignKey: 'ownerId' 
});

Product.hasMany(Claim, { foreignKey: 'productId' });

Claim.belongsTo(Product, { 
    foreignKey: 'productId' 
});

User.hasMany(Claim, { foreignKey: 'claimerId' });

Claim.belongsTo(User, { 
    foreignKey: 'claimerId' 
});

Product.hasMany(ProductVisibility, { foreignKey: 'productId' });

ProductVisibility.belongsTo(Product, { 
    foreignKey: 'productId' 
});

Group.hasMany(ProductVisibility, { foreignKey: 'groupId' });

ProductVisibility.belongsTo(Group, { 
    foreignKey: 'groupId' 
});

module.exports = {
  sequelize,
  User,
  Group,
  Tag,
  GroupMember,
  GroupMemberTag,
  Product,
  Claim,
  ProductVisibility
};