/**
 * Base Business Provider Interface
 * All business data providers must implement this interface.
 */
export class BaseBusinessProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Search for businesses given criteria
   * @param {object} params
   * @param {string} params.query - Business name or general search query
   * @param {string} [params.city] - City
   * @param {string} [params.state] - State
   * @param {string} [params.country] - Country
   * @param {string} [params.category] - Business category / primary type
   * @param {number} [params.limit=10] - Maximum number of results
   * @returns {Promise<Array<object>>} Unified business objects
   */
  async searchBusinesses(params) {
    throw new Error(`searchBusinesses() must be implemented by ${this.constructor.name}`);
  }
}
