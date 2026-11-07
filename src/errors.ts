export class CountryRulesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CountryRulesError";
  }
}

export class UnknownCountryError extends CountryRulesError {
  constructor(country: string) {
    super(`Unknown country or territory: ${country}`);
    this.name = "UnknownCountryError";
  }
}

export class InvalidCountryCodeError extends CountryRulesError {
  constructor(code: string) {
    super(`Invalid country code: ${code}`);
    this.name = "InvalidCountryCodeError";
  }
}

export class InvalidAddressError extends CountryRulesError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAddressError";
  }
}
