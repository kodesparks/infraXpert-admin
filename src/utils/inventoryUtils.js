/**
 * Utility functions for inventory management
 */

/**
 * Generate meaningful inventory code based on category and item ID
 * @param {string} category - The category of the item
 * @param {string} itemId - The MongoDB ID of the item
 * @returns {string} - Generated inventory code (e.g., CEM-A1B2, STEEL-C3D4, MIXER-E5F6)
 */
export const generateInventoryCode = (category, itemId) => {
  if (!category || !itemId) return itemId || 'N/A'
  
  // Extract last 4 characters from MongoDB ID for uniqueness
  const idSuffix = itemId.slice(-4).toUpperCase()
  
  // Map categories to prefixes
  const categoryPrefixes = {
    'Cement': 'CEM',
    'Iron': 'STEEL', 
    'Concrete Mixer': 'MIXER'
  }
  
  const prefix = categoryPrefixes[category] || 'ITEM'
  return `${prefix}-${idSuffix}`
}

/**
 * Get category prefix for a given category
 * @param {string} category - The category name
 * @returns {string} - The prefix for the category
 */
export const getCategoryPrefix = (category) => {
  const categoryPrefixes = {
    'Cement': 'CEM',
    'Iron': 'STEEL', 
    'Concrete Mixer': 'MIXER'
  }
  
  return categoryPrefixes[category] || 'ITEM'
}

/**
 * Get all available category prefixes
 * @returns {Object} - Object containing all category prefixes
 */
export const getAllCategoryPrefixes = () => {
  return {
    'Cement': 'CEM',
    'Iron': 'STEEL', 
    'Concrete Mixer': 'MIXER'
  }
}
