const { query } = require("../utils/db");

async function listEnabledTags() {
  return query("SELECT * FROM tags WHERE enabled = 1 ORDER BY type ASC, id ASC");
}

async function listEnabledTagsByIds(tagIds) {
  if (!tagIds.length) {
    return [];
  }

  const placeholders = tagIds.map(() => "?").join(", ");
  return query(`SELECT * FROM tags WHERE enabled = 1 AND id IN (${placeholders})`, tagIds);
}

module.exports = {
  listEnabledTags,
  listEnabledTagsByIds
};

