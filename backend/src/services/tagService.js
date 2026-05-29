const tagDao = require("../dao/tagDao");

async function getTags() {
  const rows = await tagDao.listEnabledTags();
  return {
    items: rows.map((tag) => ({
      id: tag.id,
      name: tag.name,
      displayName: tag.display_name,
      type: tag.type
    }))
  };
}

module.exports = {
  getTags
};

