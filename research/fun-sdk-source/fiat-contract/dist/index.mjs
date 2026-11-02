import {
  ROUTING_ENDPOINTS
} from "./chunk-2NZSOZHV.mjs";
import "./chunk-WBQAMGXK.mjs";
import {
  DOCUMENTED_ENDPOINTS,
  FUN_AUTH_ERROR_CODES,
  STATE_KEYS,
  TABLE_VERSION,
  TERMINAL_ORDER_STATUSES,
  TRANSITION_TABLE,
  UNOFFERED_ENDPOINTS,
  UNREACHABLE_STATES,
  isTerminal,
  stateKey,
  tableEntry,
  unofferedEndpoints,
  unreachableStates
} from "./chunk-6NZFTT7Q.mjs";
import {
  MOONPAY_ENDPOINTS
} from "./chunk-TIEGTTFY.mjs";
import "./chunk-LTJWGDSA.mjs";
import {
  COINBASE_ENDPOINTS,
  COINBASE_TERMS
} from "./chunk-SFR4SCDU.mjs";
import {
  STRIPE_ENDPOINTS
} from "./chunk-KLAXY6H7.mjs";
import {
  FIAT_TERMS_ENDPOINT,
  FUN_KYC_CONSENT_DOCUMENTS,
  PROVIDER_CHECKOUT_DOCUMENTS,
  PROVIDER_KYC_DOCUMENTS,
  PUBLISHED_TERMS_DOCUMENTS
} from "./chunk-TIQALG7X.mjs";

// src/codes.ts
var US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "AS",
  "GU",
  "MP",
  "PR",
  "VI"
];
var COUNTRY_CURRENCY_LIST = [
  { country: "AD", countryName: "Andorra", currency: "EUR", currencyName: "Euro" },
  { country: "AE", countryName: "United Arab Emirates", currency: "AED", currencyName: "UAE Dirham" },
  { country: "AF", countryName: "Afghanistan", currency: "AFN", currencyName: "Afghan Afghani" },
  { country: "AG", countryName: "Antigua and Barbuda", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "AI", countryName: "Anguilla", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "AL", countryName: "Albania", currency: "ALL", currencyName: "Albanian Lek" },
  { country: "AM", countryName: "Armenia", currency: "AMD", currencyName: "Armenian Dram" },
  { country: "AO", countryName: "Angola", currency: "AOA", currencyName: "Angolan Kwanza" },
  { country: "AQ", countryName: "Antarctica", currency: "USD", currencyName: "US Dollar" },
  { country: "AR", countryName: "Argentina", currency: "ARS", currencyName: "Argentine Peso" },
  { country: "AS", countryName: "American Samoa", currency: "USD", currencyName: "US Dollar" },
  { country: "AT", countryName: "Austria", currency: "EUR", currencyName: "Euro" },
  { country: "AU", countryName: "Australia", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "AW", countryName: "Aruba", currency: "AWG", currencyName: "Aruban Florin" },
  { country: "AX", countryName: "\xC5land Islands", currency: "EUR", currencyName: "Euro" },
  { country: "AZ", countryName: "Azerbaijan", currency: "AZN", currencyName: "Azerbaijani Manat" },
  { country: "BA", countryName: "Bosnia and Herzegovina", currency: "BAM", currencyName: "Bosnia-Herzegovina Convertible Mark" },
  { country: "BB", countryName: "Barbados", currency: "BBD", currencyName: "Barbadian Dollar" },
  { country: "BD", countryName: "Bangladesh", currency: "BDT", currencyName: "Bangladeshi Taka" },
  { country: "BE", countryName: "Belgium", currency: "EUR", currencyName: "Euro" },
  { country: "BF", countryName: "Burkina Faso", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "BG", countryName: "Bulgaria", currency: "BGN", currencyName: "Bulgarian Lev" },
  { country: "BH", countryName: "Bahrain", currency: "BHD", currencyName: "Bahraini Dinar" },
  { country: "BI", countryName: "Burundi", currency: "BIF", currencyName: "Burundian Franc" },
  { country: "BJ", countryName: "Benin", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "BL", countryName: "Saint Barth\xE9lemy", currency: "EUR", currencyName: "Euro" },
  { country: "BM", countryName: "Bermuda", currency: "BMD", currencyName: "Bermudan Dollar" },
  { country: "BN", countryName: "Brunei", currency: "BND", currencyName: "Brunei Dollar" },
  { country: "BO", countryName: "Bolivia", currency: "BOB", currencyName: "Bolivian Boliviano" },
  { country: "BQ", countryName: "Bonaire, Sint Eustatius and Saba", currency: "USD", currencyName: "US Dollar" },
  { country: "BR", countryName: "Brazil", currency: "BRL", currencyName: "Brazilian Real" },
  { country: "BS", countryName: "Bahamas", currency: "BSD", currencyName: "Bahamian Dollar" },
  { country: "BT", countryName: "Bhutan", currency: "BTN", currencyName: "Bhutanese Ngultrum" },
  { country: "BV", countryName: "Bouvet Island", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "BW", countryName: "Botswana", currency: "BWP", currencyName: "Botswanan Pula" },
  { country: "BY", countryName: "Belarus", currency: "BYN", currencyName: "Belarusian Ruble" },
  { country: "BZ", countryName: "Belize", currency: "BZD", currencyName: "Belize Dollar" },
  { country: "CA", countryName: "Canada", currency: "CAD", currencyName: "Canadian Dollar" },
  { country: "CC", countryName: "Cocos (Keeling) Islands", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "CD", countryName: "DR Congo", currency: "CDF", currencyName: "Congolese Franc" },
  { country: "CF", countryName: "Central African Republic", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CG", countryName: "Congo", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CH", countryName: "Switzerland", currency: "CHF", currencyName: "Swiss Franc" },
  { country: "CI", countryName: "C\xF4te d'Ivoire", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "CK", countryName: "Cook Islands", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "CL", countryName: "Chile", currency: "CLP", currencyName: "Chilean Peso" },
  { country: "CM", countryName: "Cameroon", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "CN", countryName: "China", currency: "CNY", currencyName: "Chinese Yuan" },
  { country: "CO", countryName: "Colombia", currency: "COP", currencyName: "Colombian Peso" },
  { country: "CR", countryName: "Costa Rica", currency: "CRC", currencyName: "Costa Rican Col\xF3n" },
  { country: "CU", countryName: "Cuba", currency: "CUP", currencyName: "Cuban Peso" },
  { country: "CV", countryName: "Cabo Verde", currency: "CVE", currencyName: "Cape Verdean Escudo" },
  { country: "CW", countryName: "Cura\xE7ao", currency: "ANG", currencyName: "Netherlands Antillean Guilder" },
  { country: "CX", countryName: "Christmas Island", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "CY", countryName: "Cyprus", currency: "EUR", currencyName: "Euro" },
  { country: "CZ", countryName: "Czechia", currency: "CZK", currencyName: "Czech Koruna" },
  { country: "DE", countryName: "Germany", currency: "EUR", currencyName: "Euro" },
  { country: "DJ", countryName: "Djibouti", currency: "DJF", currencyName: "Djiboutian Franc" },
  { country: "DK", countryName: "Denmark", currency: "DKK", currencyName: "Danish Krone" },
  { country: "DM", countryName: "Dominica", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "DO", countryName: "Dominican Republic", currency: "DOP", currencyName: "Dominican Peso" },
  { country: "DZ", countryName: "Algeria", currency: "DZD", currencyName: "Algerian Dinar" },
  { country: "EC", countryName: "Ecuador", currency: "USD", currencyName: "US Dollar" },
  { country: "EE", countryName: "Estonia", currency: "EUR", currencyName: "Euro" },
  { country: "EG", countryName: "Egypt", currency: "EGP", currencyName: "Egyptian Pound" },
  { country: "EH", countryName: "Western Sahara", currency: "MAD", currencyName: "Moroccan Dirham" },
  { country: "ER", countryName: "Eritrea", currency: "ERN", currencyName: "Eritrean Nakfa" },
  { country: "ES", countryName: "Spain", currency: "EUR", currencyName: "Euro" },
  { country: "ET", countryName: "Ethiopia", currency: "ETB", currencyName: "Ethiopian Birr" },
  { country: "FI", countryName: "Finland", currency: "EUR", currencyName: "Euro" },
  { country: "FJ", countryName: "Fiji", currency: "FJD", currencyName: "Fijian Dollar" },
  { country: "FK", countryName: "Falkland Islands", currency: "FKP", currencyName: "Falkland Islands Pound" },
  { country: "FM", countryName: "Micronesia", currency: "USD", currencyName: "US Dollar" },
  { country: "FO", countryName: "Faroe Islands", currency: "DKK", currencyName: "Danish Krone" },
  { country: "FR", countryName: "France", currency: "EUR", currencyName: "Euro" },
  { country: "GA", countryName: "Gabon", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "GB", countryName: "United Kingdom", currency: "GBP", currencyName: "British Pound" },
  { country: "GD", countryName: "Grenada", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "GE", countryName: "Georgia", currency: "GEL", currencyName: "Georgian Lari" },
  { country: "GF", countryName: "French Guiana", currency: "EUR", currencyName: "Euro" },
  { country: "GG", countryName: "Guernsey", currency: "GBP", currencyName: "British Pound" },
  { country: "GH", countryName: "Ghana", currency: "GHS", currencyName: "Ghanaian Cedi" },
  { country: "GI", countryName: "Gibraltar", currency: "GIP", currencyName: "Gibraltar Pound" },
  { country: "GL", countryName: "Greenland", currency: "DKK", currencyName: "Danish Krone" },
  { country: "GM", countryName: "Gambia", currency: "GMD", currencyName: "Gambian Dalasi" },
  { country: "GN", countryName: "Guinea", currency: "GNF", currencyName: "Guinean Franc" },
  { country: "GP", countryName: "Guadeloupe", currency: "EUR", currencyName: "Euro" },
  { country: "GQ", countryName: "Equatorial Guinea", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "GR", countryName: "Greece", currency: "EUR", currencyName: "Euro" },
  { country: "GS", countryName: "South Georgia and the South Sandwich Islands", currency: "GBP", currencyName: "British Pound" },
  { country: "GT", countryName: "Guatemala", currency: "GTQ", currencyName: "Guatemalan Quetzal" },
  { country: "GU", countryName: "Guam", currency: "USD", currencyName: "US Dollar" },
  { country: "GW", countryName: "Guinea-Bissau", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "GY", countryName: "Guyana", currency: "GYD", currencyName: "Guyanaese Dollar" },
  { country: "HK", countryName: "Hong Kong", currency: "HKD", currencyName: "Hong Kong Dollar" },
  { country: "HM", countryName: "Heard Island and McDonald Islands", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "HN", countryName: "Honduras", currency: "HNL", currencyName: "Honduran Lempira" },
  { country: "HR", countryName: "Croatia", currency: "EUR", currencyName: "Euro" },
  { country: "HT", countryName: "Haiti", currency: "HTG", currencyName: "Haitian Gourde" },
  { country: "HU", countryName: "Hungary", currency: "HUF", currencyName: "Hungarian Forint" },
  { country: "ID", countryName: "Indonesia", currency: "IDR", currencyName: "Indonesian Rupiah" },
  { country: "IE", countryName: "Ireland", currency: "EUR", currencyName: "Euro" },
  { country: "IL", countryName: "Israel", currency: "ILS", currencyName: "Israeli New Shekel" },
  { country: "IM", countryName: "Isle of Man", currency: "GBP", currencyName: "British Pound" },
  { country: "IN", countryName: "India", currency: "INR", currencyName: "Indian Rupee" },
  { country: "IO", countryName: "British Indian Ocean Territory", currency: "USD", currencyName: "US Dollar" },
  { country: "IQ", countryName: "Iraq", currency: "IQD", currencyName: "Iraqi Dinar" },
  { country: "IR", countryName: "Iran", currency: "IRR", currencyName: "Iranian Rial" },
  { country: "IS", countryName: "Iceland", currency: "ISK", currencyName: "Icelandic Kr\xF3na" },
  { country: "IT", countryName: "Italy", currency: "EUR", currencyName: "Euro" },
  { country: "JE", countryName: "Jersey", currency: "GBP", currencyName: "British Pound" },
  { country: "JM", countryName: "Jamaica", currency: "JMD", currencyName: "Jamaican Dollar" },
  { country: "JO", countryName: "Jordan", currency: "JOD", currencyName: "Jordanian Dinar" },
  { country: "JP", countryName: "Japan", currency: "JPY", currencyName: "Japanese Yen" },
  { country: "KE", countryName: "Kenya", currency: "KES", currencyName: "Kenyan Shilling" },
  { country: "KG", countryName: "Kyrgyzstan", currency: "KGS", currencyName: "Kyrgystani Som" },
  { country: "KH", countryName: "Cambodia", currency: "KHR", currencyName: "Cambodian Riel" },
  { country: "KI", countryName: "Kiribati", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "KM", countryName: "Comoros", currency: "KMF", currencyName: "Comorian Franc" },
  { country: "KN", countryName: "Saint Kitts and Nevis", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "KP", countryName: "North Korea", currency: "KPW", currencyName: "North Korean Won" },
  { country: "KR", countryName: "South Korea", currency: "KRW", currencyName: "South Korean Won" },
  { country: "KW", countryName: "Kuwait", currency: "KWD", currencyName: "Kuwaiti Dinar" },
  { country: "KY", countryName: "Cayman Islands", currency: "KYD", currencyName: "Cayman Islands Dollar" },
  { country: "KZ", countryName: "Kazakhstan", currency: "KZT", currencyName: "Kazakhstani Tenge" },
  { country: "LA", countryName: "Laos", currency: "LAK", currencyName: "Laotian Kip" },
  { country: "LB", countryName: "Lebanon", currency: "LBP", currencyName: "Lebanese Pound" },
  { country: "LC", countryName: "Saint Lucia", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "LI", countryName: "Liechtenstein", currency: "CHF", currencyName: "Swiss Franc" },
  { country: "LK", countryName: "Sri Lanka", currency: "LKR", currencyName: "Sri Lankan Rupee" },
  { country: "LR", countryName: "Liberia", currency: "LRD", currencyName: "Liberian Dollar" },
  { country: "LS", countryName: "Lesotho", currency: "LSL", currencyName: "Lesotho Loti" },
  { country: "LT", countryName: "Lithuania", currency: "EUR", currencyName: "Euro" },
  { country: "LU", countryName: "Luxembourg", currency: "EUR", currencyName: "Euro" },
  { country: "LV", countryName: "Latvia", currency: "EUR", currencyName: "Euro" },
  { country: "LY", countryName: "Libya", currency: "LYD", currencyName: "Libyan Dinar" },
  { country: "MA", countryName: "Morocco", currency: "MAD", currencyName: "Moroccan Dirham" },
  { country: "MC", countryName: "Monaco", currency: "EUR", currencyName: "Euro" },
  { country: "MD", countryName: "Moldova", currency: "MDL", currencyName: "Moldovan Leu" },
  { country: "ME", countryName: "Montenegro", currency: "EUR", currencyName: "Euro" },
  { country: "MF", countryName: "Saint Martin", currency: "EUR", currencyName: "Euro" },
  { country: "MG", countryName: "Madagascar", currency: "MGA", currencyName: "Malagasy Ariary" },
  { country: "MH", countryName: "Marshall Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "MK", countryName: "North Macedonia", currency: "MKD", currencyName: "Macedonian Denar" },
  { country: "ML", countryName: "Mali", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "MM", countryName: "Myanmar", currency: "MMK", currencyName: "Myanmar Kyat" },
  { country: "MN", countryName: "Mongolia", currency: "MNT", currencyName: "Mongolian Tugrik" },
  { country: "MO", countryName: "Macao", currency: "MOP", currencyName: "Macanese Pataca" },
  { country: "MP", countryName: "Northern Mariana Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "MQ", countryName: "Martinique", currency: "EUR", currencyName: "Euro" },
  { country: "MR", countryName: "Mauritania", currency: "MRU", currencyName: "Mauritanian Ouguiya" },
  { country: "MS", countryName: "Montserrat", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "MT", countryName: "Malta", currency: "EUR", currencyName: "Euro" },
  { country: "MU", countryName: "Mauritius", currency: "MUR", currencyName: "Mauritian Rupee" },
  { country: "MV", countryName: "Maldives", currency: "MVR", currencyName: "Maldivian Rufiyaa" },
  { country: "MW", countryName: "Malawi", currency: "MWK", currencyName: "Malawian Kwacha" },
  { country: "MX", countryName: "Mexico", currency: "MXN", currencyName: "Mexican Peso" },
  { country: "MY", countryName: "Malaysia", currency: "MYR", currencyName: "Malaysian Ringgit" },
  { country: "MZ", countryName: "Mozambique", currency: "MZN", currencyName: "Mozambican Metical" },
  { country: "NA", countryName: "Namibia", currency: "NAD", currencyName: "Namibian Dollar" },
  { country: "NC", countryName: "New Caledonia", currency: "XPF", currencyName: "CFP Franc" },
  { country: "NE", countryName: "Niger", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "NF", countryName: "Norfolk Island", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "NG", countryName: "Nigeria", currency: "NGN", currencyName: "Nigerian Naira" },
  { country: "NI", countryName: "Nicaragua", currency: "NIO", currencyName: "Nicaraguan C\xF3rdoba" },
  { country: "NL", countryName: "Netherlands", currency: "EUR", currencyName: "Euro" },
  { country: "NO", countryName: "Norway", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "NP", countryName: "Nepal", currency: "NPR", currencyName: "Nepalese Rupee" },
  { country: "NR", countryName: "Nauru", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "NU", countryName: "Niue", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "NZ", countryName: "New Zealand", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "OM", countryName: "Oman", currency: "OMR", currencyName: "Omani Rial" },
  { country: "PA", countryName: "Panama", currency: "PAB", currencyName: "Panamanian Balboa" },
  { country: "PE", countryName: "Peru", currency: "PEN", currencyName: "Peruvian Sol" },
  { country: "PF", countryName: "French Polynesia", currency: "XPF", currencyName: "CFP Franc" },
  { country: "PG", countryName: "Papua New Guinea", currency: "PGK", currencyName: "Papua New Guinean Kina" },
  { country: "PH", countryName: "Philippines", currency: "PHP", currencyName: "Philippine Peso" },
  { country: "PK", countryName: "Pakistan", currency: "PKR", currencyName: "Pakistani Rupee" },
  { country: "PL", countryName: "Poland", currency: "PLN", currencyName: "Polish Z\u0142oty" },
  { country: "PM", countryName: "Saint Pierre and Miquelon", currency: "EUR", currencyName: "Euro" },
  { country: "PN", countryName: "Pitcairn", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "PR", countryName: "Puerto Rico", currency: "USD", currencyName: "US Dollar" },
  { country: "PS", countryName: "Palestine", currency: "ILS", currencyName: "Israeli New Shekel" },
  { country: "PT", countryName: "Portugal", currency: "EUR", currencyName: "Euro" },
  { country: "PW", countryName: "Palau", currency: "USD", currencyName: "US Dollar" },
  { country: "PY", countryName: "Paraguay", currency: "PYG", currencyName: "Paraguayan Guarani" },
  { country: "QA", countryName: "Qatar", currency: "QAR", currencyName: "Qatari Riyal" },
  { country: "RE", countryName: "R\xE9union", currency: "EUR", currencyName: "Euro" },
  { country: "RO", countryName: "Romania", currency: "RON", currencyName: "Romanian Leu" },
  { country: "RS", countryName: "Serbia", currency: "RSD", currencyName: "Serbian Dinar" },
  { country: "RU", countryName: "Russia", currency: "RUB", currencyName: "Russian Ruble" },
  { country: "RW", countryName: "Rwanda", currency: "RWF", currencyName: "Rwandan Franc" },
  { country: "SA", countryName: "Saudi Arabia", currency: "SAR", currencyName: "Saudi Riyal" },
  { country: "SB", countryName: "Solomon Islands", currency: "SBD", currencyName: "Solomon Islands Dollar" },
  { country: "SC", countryName: "Seychelles", currency: "SCR", currencyName: "Seychellois Rupee" },
  { country: "SD", countryName: "Sudan", currency: "SDG", currencyName: "Sudanese Pound" },
  { country: "SE", countryName: "Sweden", currency: "SEK", currencyName: "Swedish Krona" },
  { country: "SG", countryName: "Singapore", currency: "SGD", currencyName: "Singapore Dollar" },
  { country: "SH", countryName: "Saint Helena, Ascension and Tristan da Cunha", currency: "SHP", currencyName: "Saint Helena Pound" },
  { country: "SI", countryName: "Slovenia", currency: "EUR", currencyName: "Euro" },
  { country: "SJ", countryName: "Svalbard and Jan Mayen", currency: "NOK", currencyName: "Norwegian Krone" },
  { country: "SK", countryName: "Slovakia", currency: "EUR", currencyName: "Euro" },
  { country: "SL", countryName: "Sierra Leone", currency: "SLE", currencyName: "Sierra Leonean Leone" },
  { country: "SM", countryName: "San Marino", currency: "EUR", currencyName: "Euro" },
  { country: "SN", countryName: "Senegal", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "SO", countryName: "Somalia", currency: "SOS", currencyName: "Somali Shilling" },
  { country: "SR", countryName: "Suriname", currency: "SRD", currencyName: "Surinamese Dollar" },
  { country: "SS", countryName: "South Sudan", currency: "SSP", currencyName: "South Sudanese Pound" },
  { country: "ST", countryName: "S\xE3o Tom\xE9 and Pr\xEDncipe", currency: "STN", currencyName: "S\xE3o Tom\xE9 and Pr\xEDncipe Dobra" },
  { country: "SV", countryName: "El Salvador", currency: "USD", currencyName: "US Dollar" },
  { country: "SX", countryName: "Sint Maarten", currency: "ANG", currencyName: "Netherlands Antillean Guilder" },
  { country: "SY", countryName: "Syria", currency: "SYP", currencyName: "Syrian Pound" },
  { country: "SZ", countryName: "Eswatini", currency: "SZL", currencyName: "Swazi Lilangeni" },
  { country: "TC", countryName: "Turks and Caicos Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "TD", countryName: "Chad", currency: "XAF", currencyName: "Central African CFA Franc" },
  { country: "TF", countryName: "French Southern Territories", currency: "EUR", currencyName: "Euro" },
  { country: "TG", countryName: "Togo", currency: "XOF", currencyName: "West African CFA Franc" },
  { country: "TH", countryName: "Thailand", currency: "THB", currencyName: "Thai Baht" },
  { country: "TJ", countryName: "Tajikistan", currency: "TJS", currencyName: "Tajikistani Somoni" },
  { country: "TK", countryName: "Tokelau", currency: "NZD", currencyName: "New Zealand Dollar" },
  { country: "TL", countryName: "Timor-Leste", currency: "USD", currencyName: "US Dollar" },
  { country: "TM", countryName: "Turkmenistan", currency: "TMT", currencyName: "Turkmenistani Manat" },
  { country: "TN", countryName: "Tunisia", currency: "TND", currencyName: "Tunisian Dinar" },
  { country: "TO", countryName: "Tonga", currency: "TOP", currencyName: "Tongan Pa\u02BBanga" },
  { country: "TR", countryName: "Turkey", currency: "TRY", currencyName: "Turkish Lira" },
  { country: "TT", countryName: "Trinidad and Tobago", currency: "TTD", currencyName: "Trinidad and Tobago Dollar" },
  { country: "TV", countryName: "Tuvalu", currency: "AUD", currencyName: "Australian Dollar" },
  { country: "TW", countryName: "Taiwan", currency: "TWD", currencyName: "New Taiwan Dollar" },
  { country: "TZ", countryName: "Tanzania", currency: "TZS", currencyName: "Tanzanian Shilling" },
  { country: "UA", countryName: "Ukraine", currency: "UAH", currencyName: "Ukrainian Hryvnia" },
  { country: "UG", countryName: "Uganda", currency: "UGX", currencyName: "Ugandan Shilling" },
  { country: "UM", countryName: "United States Minor Outlying Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "US", countryName: "United States", currency: "USD", currencyName: "US Dollar" },
  { country: "UY", countryName: "Uruguay", currency: "UYU", currencyName: "Uruguayan Peso" },
  { country: "UZ", countryName: "Uzbekistan", currency: "UZS", currencyName: "Uzbekistani Som" },
  { country: "VA", countryName: "Vatican City", currency: "EUR", currencyName: "Euro" },
  { country: "VC", countryName: "Saint Vincent and the Grenadines", currency: "XCD", currencyName: "East Caribbean Dollar" },
  { country: "VE", countryName: "Venezuela", currency: "VES", currencyName: "Venezuelan Bol\xEDvar" },
  { country: "VG", countryName: "British Virgin Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "VI", countryName: "United States Virgin Islands", currency: "USD", currencyName: "US Dollar" },
  { country: "VN", countryName: "Vietnam", currency: "VND", currencyName: "Vietnamese Dong" },
  { country: "VU", countryName: "Vanuatu", currency: "VUV", currencyName: "Vanuatu Vatu" },
  { country: "WF", countryName: "Wallis and Futuna", currency: "XPF", currencyName: "CFP Franc" },
  { country: "WS", countryName: "Samoa", currency: "WST", currencyName: "Samoan Tala" },
  { country: "YE", countryName: "Yemen", currency: "YER", currencyName: "Yemeni Rial" },
  { country: "YT", countryName: "Mayotte", currency: "EUR", currencyName: "Euro" },
  { country: "ZA", countryName: "South Africa", currency: "ZAR", currencyName: "South African Rand" },
  { country: "ZM", countryName: "Zambia", currency: "ZMW", currencyName: "Zambian Kwacha" },
  { country: "ZW", countryName: "Zimbabwe", currency: "ZWL", currencyName: "Zimbabwean Dollar" }
];
var CountryCode = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.country]));
var uniqueCurrencies = /* @__PURE__ */ new Map();
for (const entry of COUNTRY_CURRENCY_LIST) {
  if (!uniqueCurrencies.has(entry.currency)) uniqueCurrencies.set(entry.currency, entry.currencyName);
}
var FiatCurrencyCode = Object.fromEntries([...uniqueCurrencies.keys()].map((code) => [code, code]));
var COUNTRY_NAMES = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.countryName]));
var FIAT_CURRENCY_NAMES = Object.fromEntries(uniqueCurrencies);
var COUNTRY_TO_CURRENCY = Object.fromEntries(COUNTRY_CURRENCY_LIST.map((e) => [e.country, e.currency]));
var PAYMENT_METHOD_CATEGORIES = ["card", "apple_pay", "google_pay", "bank_transfer"];

// src/schemas.ts
import { z } from "zod";
var FIAT_CURRENCY_CODES = Object.keys(FIAT_CURRENCY_NAMES);
var obj = (shape) => z.object(shape).strict();
var JsonSchema = z.lazy(
  () => z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonSchema),
    z.record(z.string(), JsonSchema)
  ])
);
var HTTP_VERBS = ["GET", "POST"];
var ENDPOINT_PATTERN = /^(GET|POST) \/fiat\/[^\s]*$/;
var $endpoint = z.string().regex(ENDPOINT_PATTERN, 'endpoint must read "<GET|POST> /fiat/\u2026"');
var FiatEndpointSchema = $endpoint;
var UsStateCodeSchema = z.enum(US_STATE_CODES);
var $provider = z.enum([
  "TRANSAK",
  "SWAPPED",
  "BANXA",
  "MOONPAY",
  "MOONPAY_GUEST",
  "STRIPE",
  "COINBASE",
  "CROSSMINT"
]);
var FiatProviderSchema = $provider;
var $kycProvider = z.enum(["SUMSUB"]);
var KYCProviderSchema = $kycProvider;
var $surfaceProvider = z.enum([...$provider.options, ...$kycProvider.options]);
var SurfaceProviderSchema = $surfaceProvider;
var $orderStatus = z.enum([
  "CREATING",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFYING",
  "PROCESSING",
  "PENDING_DELIVERY",
  "ON_HOLD",
  "CRYPTO_SENT",
  "SETTLED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "REFUNDED",
  "CAPTURE_ORPHANED"
]);
var OrderStatusSchema = $orderStatus;
var $recovery = z.enum(["REQUOTE", "RETRY_PAYMENT", "CONTACT_SUPPORT", "NONE"]);
var RecoverySchema = $recovery;
var $failureReason = z.union([
  obj({
    category: z.enum([
      "PAYMENT_DECLINED",
      "KYC_REJECTED",
      "PROVIDER_OUTAGE",
      "USER_ERROR",
      "CANCELLED"
    ]),
    retryable: z.boolean(),
    recovery: $recovery,
    code: z.string().optional()
  }),
  obj({
    category: z.literal("EXPIRED"),
    which: z.enum(["QUOTE", "PAYMENT_WINDOW", "INSTRUCTIONS"]),
    retryable: z.boolean(),
    recovery: $recovery,
    code: z.string().optional()
  })
]);
var FailureReasonSchema = $failureReason;
var $money = obj({ currency: z.enum(FIAT_CURRENCY_CODES), amount: z.string() });
var FiatAmountSchema = $money;
var $cryptoAmount = obj({
  currency: z.string(),
  network: z.string(),
  amount: z.string()
});
var CryptoAmountSchema = $cryptoAmount;
var $feeLine = obj({ id: z.string(), labelFallback: z.string(), amount: z.string() });
var FeeLineSchema = $feeLine;
var $quote = obj({
  quoteRef: z.string(),
  fiat: $money,
  crypto: $cryptoAmount,
  rate: z.string(),
  totalFee: z.string(),
  feeBreakdown: z.array($feeLine),
  paymentMethod: z.enum(PAYMENT_METHOD_CATEGORIES),
  expiresAt: z.string(),
  feeSubsidy: $money.optional()
});
var QuoteSchema = $quote;
var $quoteLimitRange = obj({ min: z.string(), max: z.string() });
var QuoteLimitRangeSchema = $quoteLimitRange;
var $quoteLimits = obj({
  min: z.string(),
  max: z.string(),
  serviceableRanges: z.array($quoteLimitRange).min(1).optional()
});
var QuoteLimitsSchema = $quoteLimits;
var $instrument = obj({ brandLabel: z.string(), last4: z.string() });
var InstrumentSchema = $instrument;
var $orderRef = obj({
  orderId: z.string(),
  fiat: $money,
  crypto: $cryptoAmount,
  method: z.enum(PAYMENT_METHOD_CATEGORIES),
  createdAt: z.string(),
  status: $orderStatus
});
var OrderRefSchema = $orderRef;
var $orderSummary = obj({
  orderId: z.string(),
  fiat: $money,
  crypto: $cryptoAmount.optional(),
  method: z.enum(PAYMENT_METHOD_CATEGORIES),
  createdAt: z.string(),
  instrument: $instrument.optional()
});
var OrderSummarySchema = $orderSummary;
var $statusHistoryEntry = obj({ status: $orderStatus });
var StatusHistoryEntrySchema = $statusHistoryEntry;
var $tx = obj({ chainId: z.number(), hash: z.string() });
var TxSchema = $tx;
var $refund = obj({
  currency: z.enum(FIAT_CURRENCY_CODES),
  amount: z.string(),
  expectedBy: z.string()
});
var RefundSchema = $refund;
var $surfaceKind = z.enum([
  "URL_REDIRECT",
  "KYC_SDK",
  "PCI_COMPONENT",
  "PAY_SHEET",
  "ACH_COMPONENT",
  "AUTH_COMPONENT"
]);
var SurfaceKindSchema = $surfaceKind;
var $surfaceBase = {
  provider: $surfaceProvider,
  /**
   * The one deliberate non-strict leaf in the contract. Provider inputs are the adapter's
   * vocabulary, so typing them here would drag every provider field change through a contract
   * release and both consumers — and a normalised `environment` could only be lossy across
   * Transak's four values and Banxa's two. Both ends narrow instead: fun-backend emits from a
   * typed provider session, the client adapter validates with its own schema, and a recorded
   * fixture per `(provider, kind)` keeps the two honest.
   */
  params: z.record(z.string(), JsonSchema),
  expiresAt: z.string().optional()
};
var $preferredIdentityDocument = obj({
  idDocType: z.enum(["PASSPORT", "ID_CARD", "DRIVERS", "RESIDENCE_PERMIT", "VISA"]),
  country: z.string().regex(/^[A-Z]{3}$/)
});
var PreferredIdentityDocumentSchema = $preferredIdentityDocument;
var STANDARD_KYC_FIELD_IDS = [
  "LEGAL_FIRST_NAME",
  "LEGAL_MIDDLE_NAME",
  "LEGAL_LAST_NAME",
  "DATE_OF_BIRTH",
  "COUNTRY_OF_BIRTH",
  "CITY_OF_BIRTH",
  "NATIONALITY",
  "EMAIL_ADDRESS",
  "EMAIL_OWNERSHIP_VERIFICATION",
  "PHONE_NUMBER",
  "PHONE_OWNERSHIP_VERIFICATION",
  "RESIDENTIAL_ADDRESS_LINE_1",
  "RESIDENTIAL_ADDRESS_LINE_2",
  "RESIDENTIAL_ADDRESS_CITY",
  "RESIDENTIAL_ADDRESS_REGION",
  "RESIDENTIAL_ADDRESS_POSTAL_CODE",
  "RESIDENTIAL_ADDRESS_COUNTRY",
  "TAX_IDENTIFIER",
  "US_SSN_LAST_FOUR",
  "TAX_RESIDENCE_COUNTRY",
  "EMPLOYMENT_STATUS",
  "OCCUPATION_INDUSTRY",
  "OCCUPATION_TITLE",
  "SOURCE_OF_FUNDS_DECLARATION",
  "SOURCE_OF_INCOME_DECLARATION",
  "SOURCE_OF_WEALTH_DECLARATION",
  "PURPOSE_OF_SERVICE",
  "PURPOSE_OF_TRANSACTION",
  "CUSTOMER_CATEGORY"
];
var KYC_ACKNOWLEDGEMENT_FIELD_IDS = [
  "RISK_ACKNOWLEDGEMENT",
  "COOLING_OFF_ACKNOWLEDGEMENT",
  "TERMS_ACCEPTANCE"
];
var $questionnaireKycFieldId = z.custom(
  (value) => typeof value === "string" && /^QUESTIONNAIRE_RESPONSE:[^:]+:[^:]+$/.test(value),
  "Questionnaire field ids must identify exactly one policy and question"
);
var $kycFieldId = z.union([
  z.enum(STANDARD_KYC_FIELD_IDS),
  z.enum(KYC_ACKNOWLEDGEMENT_FIELD_IDS),
  $questionnaireKycFieldId
]);
var KycFieldIdSchema = $kycFieldId;
var $clientExecutedDelivery = obj({
  channel: z.literal("CLIENT_EXECUTED"),
  source: z.literal("CURRENT_SESSION_INPUTS"),
  allowedFieldIds: z.array($kycFieldId).min(1)
}).superRefine((delivery, context2) => {
  if (new Set(delivery.allowedFieldIds).size !== delivery.allowedFieldIds.length) {
    context2.addIssue({
      code: "custom",
      path: ["allowedFieldIds"],
      message: "allowedFieldIds must be unique"
    });
  }
});
var ClientExecutedDeliverySchema = $clientExecutedDelivery;
var $surface = z.union([
  obj({
    ...$surfaceBase,
    kind: z.literal("KYC_SDK"),
    provider: $kycProvider,
    preferredDocuments: obj({ IDENTITY: $preferredIdentityDocument }).optional()
  }),
  obj({
    ...$surfaceBase,
    kind: z.enum(["URL_REDIRECT", "PCI_COMPONENT", "PAY_SHEET", "ACH_COMPONENT", "AUTH_COMPONENT"]),
    provider: $provider,
    delivery: $clientExecutedDelivery.optional()
  })
]);
var SurfaceSchema = $surface;
var $paymentSurface = obj({
  ...$surfaceBase,
  kind: z.enum(["URL_REDIRECT", "PCI_COMPONENT", "PAY_SHEET", "ACH_COMPONENT"]),
  provider: $provider,
  delivery: $clientExecutedDelivery.optional()
});
var PaymentSurfaceSchema = $paymentSurface;
var $instructionField = obj({
  id: z.string(),
  labelFallback: z.string(),
  value: z.string()
});
var InstructionFieldSchema = $instructionField;
var $instructions = z.union([
  obj({ kind: z.literal("DEEPLINK"), url: z.string(), appVariants: z.array(z.string()) }),
  obj({ kind: z.literal("QR_IMAGE"), url: z.string() }),
  obj({
    kind: z.literal("BANK_FIELDS"),
    fields: z.array($instructionField),
    expiresAt: z.string().optional()
  }),
  obj({ kind: z.literal("REFERENCE"), code: z.string(), expiresAt: z.string() })
]);
var InstructionsSchema = $instructions;
var $selectOption = obj({ id: z.string(), labelFallback: z.string() });
var SelectOptionSchema = $selectOption;
var $formFieldType = z.enum(["TEXT", "DATE", "SELECT", "COUNTRY", "FILE", "HOSTED_LINK"]);
var FormFieldTypeSchema = $formFieldType;
var $formFieldBase = { id: $kycFieldId, labelFallback: z.string(), required: z.boolean() };
var $formField = z.union([
  obj({ ...$formFieldBase, type: z.literal("TEXT"), regex: z.string().optional() }),
  obj({ ...$formFieldBase, type: z.literal("DATE") }),
  obj({ ...$formFieldBase, type: z.literal("SELECT"), options: z.array($selectOption) }),
  obj({ ...$formFieldBase, type: z.literal("COUNTRY") }),
  obj({ ...$formFieldBase, type: z.literal("FILE") }),
  obj({ ...$formFieldBase, type: z.literal("HOSTED_LINK"), url: z.string() })
]);
var FormFieldSchema = $formField;
var $formDescriptor = obj({ formId: z.string(), fields: z.array($formField) });
var FormDescriptorSchema = $formDescriptor;
var FIELD_SPEC_TYPES = [
  "TEXT",
  "DATE",
  "COUNTRY",
  "FILE",
  "SELECT",
  "HOSTED_LINK",
  "FORM_VALUES",
  "TERMS_ACCEPTANCE"
];
var $fieldSpec = z.union([
  obj({
    type: z.literal("TEXT"),
    length: z.number().optional(),
    regex: z.string().optional(),
    labelFallback: z.string().optional()
  }),
  obj({ type: z.literal("DATE"), labelFallback: z.string().optional() }),
  obj({ type: z.literal("COUNTRY"), labelFallback: z.string().optional() }),
  obj({ type: z.literal("FILE"), labelFallback: z.string().optional() }),
  obj({
    type: z.literal("SELECT"),
    options: z.array($selectOption).optional(),
    labelFallback: z.string().optional()
  }),
  obj({ type: z.literal("HOSTED_LINK"), url: z.string(), labelFallback: z.string().optional() }),
  obj({ type: z.literal("FORM_VALUES") }),
  obj({
    type: z.literal("TERMS_ACCEPTANCE"),
    documentUrl: z.string(),
    version: z.string(),
    labelFallback: z.string().optional()
  })
]);
var FieldSpecSchema = $fieldSpec;
var TermsAcceptanceSchema = obj({
  version: z.string(),
  acceptedAt: z.string()
});
var looksLikeFieldSpec = (value) => typeof value === "object" && value !== null && !Array.isArray(value) && typeof value.type === "string" && FIELD_SPEC_TYPES.includes(value.type);
var $params = z.record(z.string(), JsonSchema).superRefine((params, ctx) => {
  for (const [key, value] of Object.entries(params)) {
    if (looksLikeFieldSpec(value)) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: `params.${key} is FieldSpec-shaped ({type: "\u2026"}). params carry server literals the client spreads verbatim; a spec the client must collect belongs in inputs.`
      });
    }
  }
});
var TransitionParamsSchema = $params;
var $inputs = z.record(z.string(), $fieldSpec);
var TransitionInputsSchema = $inputs;
var MAX_DELAY_MS = 2 ** 31 - 1;
var MIN_INTERVAL_MS = 500;
var $pollSpec = obj({
  endpoint: $endpoint,
  params: $params.optional(),
  intervalMs: z.number().int().min(MIN_INTERVAL_MS).max(MAX_DELAY_MS),
  // Not `.int()` — 1.5 is the recorded factor and a legitimate one. `.finite()` is load-bearing:
  // zod 3's `z.number()` admits Infinity, and `Infinity >= 1` satisfies `.min(1)` on its own.
  backoffFactor: z.number().finite().min(1).optional(),
  maxIntervalMs: z.number().int().min(MIN_INTERVAL_MS).max(MAX_DELAY_MS).optional(),
  giveUpAfterMs: z.number().int().nonnegative().max(MAX_DELAY_MS).optional()
}).superRefine((spec, ctx) => {
  if (spec.backoffFactor !== void 0 && spec.maxIntervalMs === void 0) {
    ctx.addIssue({
      code: "custom",
      path: ["maxIntervalMs"],
      message: "maxIntervalMs is required when backoffFactor is present \u2014 an unbounded backoff grows the interval past 2^31-1, where setTimeout truncates the delay to 0 and the poll hot-loops."
    });
  }
  if (spec.maxIntervalMs !== void 0 && spec.maxIntervalMs < spec.intervalMs) {
    ctx.addIssue({
      code: "custom",
      path: ["maxIntervalMs"],
      message: `maxIntervalMs (${spec.maxIntervalMs}) is below intervalMs (${spec.intervalMs}) \u2014 a ceiling under the starting interval caps the poll at less than its own first delay.`
    });
  }
});
var PollSpecSchema = $pollSpec;
var $reportSpec = obj({
  endpoint: $endpoint,
  params: $params.optional(),
  expects: z.array(z.string()).optional(),
  result: obj({ type: z.literal("KYC_SDK_RESULT"), bodyKey: z.string().trim().min(1) }).optional()
});
var ReportSpecSchema = $reportSpec;
var $kycSdkResult = z.union([
  obj({ outcome: z.literal("COMPLETED") }),
  obj({ outcome: z.literal("FAILED"), errorType: z.string().trim().min(1) })
]);
var KycSdkResultReportSchema = $kycSdkResult;
var $clientSurfaceTransition = obj({
  id: z.string(),
  mode: z.literal("CLIENT_SURFACE"),
  report: $reportSpec
});
var $transition = z.union([
  obj({
    id: z.string(),
    mode: z.literal("SUBMIT"),
    endpoint: $endpoint,
    params: $params.optional(),
    inputs: $inputs.optional(),
    labelFallback: z.string().optional()
  }),
  obj({ id: z.string(), mode: z.literal("AWAIT"), poll: $pollSpec }),
  $clientSurfaceTransition
]);
var TransitionSchema = $transition;
var $preparedPayment = obj({
  quoteRef: z.string().trim().min(1),
  surface: $paymentSurface,
  transition: $clientSurfaceTransition
});
var PreparedPaymentSchema = $preparedPayment;
var $quoteState = obj({
  kind: z.literal("QUOTE"),
  quote: $quote,
  limits: $quoteLimits,
  helper: z.string().optional(),
  /** Present when the provider's component is the primary CTA, inline on the entry screen. */
  surface: $surface.optional(),
  error: $failureReason.optional()
});
var QuoteStateSchema = $quoteState;
var $funAuthState = obj({
  kind: z.literal("FUN_AUTH"),
  channel: z.enum(["EMAIL_OTP", "SMS_OTP"]),
  phase: z.enum(["IDENTIFIER", "CODE", "VERIFIED"]),
  expiresAtMs: z.number().int().nonnegative().optional(),
  resendAvailableAtMs: z.number().int().nonnegative().optional(),
  attemptsRemaining: z.number().int().nonnegative().optional(),
  error: $failureReason.optional()
});
var FunAuthStateSchema = $funAuthState;
var $fiatSession = obj({
  accessToken: z.string().min(1),
  refreshHandle: z.string().min(1),
  expiresAtMs: z.number().int().nonnegative()
});
var FiatSessionSchema = $fiatSession;
var $sessionAuthState = obj({
  kind: z.literal("SESSION_AUTH"),
  channel: z.enum(["EMAIL_OTP", "SMS_OTP", "PROVIDER_RENDERED"]),
  surface: $surface.optional(),
  error: $failureReason.optional()
});
var SessionAuthStateSchema = $sessionAuthState;
var $kycCaptureState = obj({
  kind: z.literal("KYC"),
  phase: z.literal("CAPTURE"),
  quote: $quote.optional(),
  surface: $surface,
  correctionReason: z.string().min(1).max(1024).optional(),
  error: $failureReason.optional()
});
var KycCaptureStateSchema = $kycCaptureState;
var $kycInputRequiredState = obj({
  kind: z.literal("KYC"),
  phase: z.literal("INPUT_REQUIRED"),
  quote: $quote.optional(),
  form: $formDescriptor,
  error: $failureReason.optional()
});
var KycInputRequiredStateSchema = $kycInputRequiredState;
var $kycReviewDuration = z.discriminatedUnion("duration", [
  obj({ duration: z.literal("BRIEF"), holdMs: z.number().int().positive().max(6e5) }),
  obj({ duration: z.literal("EXTENDED") })
]);
var KycReviewDurationSchema = $kycReviewDuration;
var $kycNoActionRequiredFields = {
  kind: z.literal("KYC"),
  phase: z.literal("NO_ACTION_REQUIRED"),
  quote: $quote.optional(),
  retryAfter: z.string().optional(),
  failureReason: $failureReason.optional(),
  error: $failureReason.optional()
};
var $kycNoActionRequiredState = z.union([
  obj({ ...$kycNoActionRequiredFields, reason: z.literal("IN_REVIEW"), review: $kycReviewDuration.optional() }),
  obj({ ...$kycNoActionRequiredFields, reason: z.enum(["ON_HOLD", "REJECTED"]) })
]);
var KycNoActionRequiredStateSchema = $kycNoActionRequiredState;
var $pendingOrderState = obj({
  kind: z.literal("PENDING_ORDER"),
  order: $orderRef,
  error: $failureReason.optional()
});
var PendingOrderStateSchema = $pendingOrderState;
var $blockedReason = z.enum([
  "REGION_UNSUPPORTED",
  "ASSET_UNSUPPORTED",
  "ALL_PROVIDERS_DECLINED",
  "AMOUNT_UNSERVABLE",
  "CLIENT_UPGRADE_REQUIRED"
]);
var BlockedReasonSchema = $blockedReason;
var $blockedState = obj({
  kind: z.literal("BLOCKED"),
  reason: $blockedReason,
  retryAfter: z.string().nullable().optional(),
  error: $failureReason.optional()
});
var BlockedStateSchema = $blockedState;
var $paymentCaptureState = obj({
  kind: z.literal("PAYMENT"),
  phase: z.literal("CAPTURE"),
  surface: $surface,
  error: $failureReason.optional()
});
var PaymentCaptureStateSchema = $paymentCaptureState;
var $paymentInstructState = obj({
  kind: z.literal("PAYMENT"),
  phase: z.literal("INSTRUCT"),
  orderId: z.string().optional(),
  instructions: $instructions,
  error: $failureReason.optional()
});
var PaymentInstructStateSchema = $paymentInstructState;
var $orderAwaitingConfirmationState = obj({
  kind: z.literal("ORDER"),
  phase: z.literal("AWAITING_CONFIRMATION"),
  quote: $quote,
  error: $failureReason.optional()
});
var OrderAwaitingConfirmationStateSchema = $orderAwaitingConfirmationState;
var $orderCreatedState = obj({
  kind: z.literal("ORDER"),
  phase: z.literal("CREATED"),
  order: $orderSummary.optional(),
  status: $orderStatus,
  statusHistory: z.array($statusHistoryEntry).optional(),
  tx: $tx.optional(),
  refund: $refund.optional(),
  failureReason: $failureReason.optional(),
  error: $failureReason.optional()
});
var OrderCreatedStateSchema = $orderCreatedState;
var $deliveryState = z.discriminatedUnion("state", [
  obj({ kind: z.literal("DELIVERY"), state: z.literal("PENDING") }),
  obj({ kind: z.literal("DELIVERY"), state: z.literal("SUCCEEDED"), txHash: z.string().min(1) }),
  obj({ kind: z.literal("DELIVERY"), state: z.literal("FAILED") })
]);
var DeliveryStateSchema = $deliveryState;
var $providerBoundFlowState = z.union([
  $quoteState,
  $sessionAuthState,
  $kycCaptureState,
  $kycInputRequiredState,
  $kycNoActionRequiredState,
  $pendingOrderState,
  $paymentCaptureState,
  $paymentInstructState,
  $orderAwaitingConfirmationState,
  $orderCreatedState,
  $deliveryState
]);
var $flowState = z.union([$providerBoundFlowState, $funAuthState, $blockedState]);
var FlowStateSchema = $flowState;
var $nonBlank = z.string().refine((value) => value.trim().length > 0, "must not be blank");
var $isoInstant = z.string().datetime({ offset: true });
var $errorBodyFields = { errorMsg: z.string(), reqId: z.string().optional() };
var $termsStage = z.enum(["CHECKOUT", "KYC"]);
var $termsDocument = obj({
  id: $nonBlank,
  kind: z.enum(["PROVIDER_TERMS", "FUN_KYC_COLLECTION", "PROVIDER_KYC_SHARING"]),
  stage: $termsStage,
  version: $nonBlank,
  contentDigest: $nonBlank,
  links: z.array(obj({ label: $nonBlank, url: z.string().regex(/^https:\/\/\S+$/, "must be an https URL") })).min(1)
});
var TermsDocumentSchema = $termsDocument;
var hasUniqueIds = (ids) => new Set(ids).size === ids.length;
var $termsAcceptance = obj({
  documentId: $nonBlank,
  version: $nonBlank,
  contentDigest: $nonBlank,
  acceptedAt: $isoInstant
});
var TermsDocumentAcceptanceSchema = $termsAcceptance;
var $termsRequest = obj({
  provider: $provider,
  acceptances: z.array($termsAcceptance).min(1).refine((acceptances) => hasUniqueIds(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
});
var FiatTermsRequestSchema = $termsRequest;
var $termsResponse = obj({ recorded: z.array($nonBlank) });
var FiatTermsResponseSchema = $termsResponse;
var $termsErrorBody = obj({
  errorCode: $nonBlank,
  ...$errorBodyFields,
  reason: z.enum(["STALE_TERMS", "INVALID_REQUEST", "RATE_LIMITED", "PROVIDER_UNAVAILABLE"]),
  recovery: z.enum(["RETRY", "REQUOTE", "NONE"])
});
var FiatTermsErrorBodySchema = $termsErrorBody;
var $evmAddress = z.custom(
  (value) => typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value),
  "must be an EVM address: 0x and 40 hex digits"
);
var $solanaAddress = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "must be a Solana base58 address");
var $evmDestinationAsset = obj({
  vm: z.literal("EVM"),
  chainId: z.number().int().positive(),
  asset: z.discriminatedUnion("kind", [
    obj({
      kind: z.literal("FUNGIBLE"),
      token: z.discriminatedUnion("type", [
        obj({ type: z.literal("NATIVE") }),
        obj({ type: z.literal("ERC20"), address: $evmAddress })
      ])
    }),
    obj({
      kind: z.literal("NON_FUNGIBLE"),
      address: $evmAddress,
      tokenId: z.string().regex(/^(0|[1-9]\d*)$/, "must be a decimal integer")
    })
  ])
});
var $solanaDestinationAsset = obj({
  vm: z.literal("SOLANA"),
  asset: z.discriminatedUnion("kind", [
    obj({
      kind: z.literal("FUNGIBLE"),
      token: z.discriminatedUnion("type", [
        obj({ type: z.literal("NATIVE") }),
        obj({ type: z.literal("SPL"), address: $solanaAddress })
      ])
    }),
    obj({ kind: z.literal("NON_FUNGIBLE"), address: $solanaAddress })
  ])
});
var $destinationAsset = z.discriminatedUnion("vm", [$evmDestinationAsset, $solanaDestinationAsset]);
var DestinationAssetSchema = $destinationAsset;
var $decimalAmount = z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a decimal string");
var compareDecimals = (left, right) => {
  const [leftWhole = "", leftFraction = ""] = left.split(".");
  const [rightWhole = "", rightFraction = ""] = right.split(".");
  if (leftWhole.length !== rightWhole.length) return leftWhole.length - rightWhole.length;
  const width = Math.max(leftFraction.length, rightFraction.length);
  const leftDigits = leftWhole + leftFraction.padEnd(width, "0");
  const rightDigits = rightWhole + rightFraction.padEnd(width, "0");
  return leftDigits < rightDigits ? -1 : leftDigits > rightDigits ? 1 : 0;
};
var $countryCode = z.enum(Object.keys(CountryCode));
var $routingProvider = $provider.extract(["TRANSAK", "BANXA", "MOONPAY", "MOONPAY_GUEST", "STRIPE", "COINBASE"]);
var $optionalGeoField = z.union([$nonBlank, z.literal("")]).optional();
var US_REGION_REQUIRED = "a US buyer needs a US state code as region";
var hasUsRegion = (country, region) => country !== "US" || UsStateCodeSchema.safeParse(region).success;
var $routingTableProviderInputs = obj({
  MOONPAY: obj({ accessToken: $nonBlank.optional() }).optional()
});
var $routingTableRequest = obj({
  fiatCurrencyCode: z.enum(FIAT_CURRENCY_CODES).optional(),
  cryptoCurrencyCode: $nonBlank,
  chainId: $nonBlank,
  country: $countryCode,
  region: $optionalGeoField,
  // Duplicates are allowed; the response lists each method once.
  methods: z.array(z.enum(PAYMENT_METHOD_CATEGORIES)).min(1),
  providers: $routingTableProviderInputs.optional(),
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
}).refine((request2) => hasUsRegion(request2.country, request2.region), { message: US_REGION_REQUIRED, path: ["region"] });
var FiatRoutingTableRequestSchema = $routingTableRequest;
var $routingTableProvider = obj({
  provider: $routingProvider,
  next: z.enum(["READY", "AUTH", "DECLARATIVE_KYC", "DOCUMENTARY_KYC", "PENDING_REVIEW"]),
  visibility: z.enum(["COMPLETE", "PARTIAL", "AUTH_GATED"]),
  currentLimit: $decimalAmount.nullable()
});
var $routingTableInterval = obj({
  min: $decimalAmount,
  max: $decimalAmount,
  providers: z.array($routingTableProvider).min(1).refine((providers) => hasUniqueIds(providers.map((entry) => entry.provider)), "each provider is listed once")
}).refine((interval) => compareDecimals(interval.min, interval.max) <= 0, { message: "min must not exceed max", path: ["max"] });
var $routingTableMethod = obj({
  method: z.enum(PAYMENT_METHOD_CATEGORIES),
  unavailableReason: z.enum(["USER_LIMIT", "KYC_REJECTED", "PROVIDER_OUTAGE", "NOT_SERVED"]).optional(),
  intervals: z.array($routingTableInterval).superRefine((intervals, context2) => {
    intervals.forEach((interval, index) => {
      const previous = intervals[index - 1];
      if (previous !== void 0 && compareDecimals(interval.min, previous.max) <= 0) {
        context2.addIssue({ code: "custom", path: [index, "min"], message: "intervals are sorted and do not overlap" });
      }
    });
  })
}).refine((method) => method.unavailableReason === void 0 || method.intervals.length === 0, {
  message: "unavailableReason only with no interval",
  path: ["unavailableReason"]
});
var $routingTableResponse = obj({
  expiresAt: $isoInstant,
  methods: z.array($routingTableMethod).refine((methods) => hasUniqueIds(methods.map((entry) => entry.method)), "each method is listed once"),
  feeSubsidy: obj({ subsidized: z.boolean() }).optional()
});
var FiatRoutingTableResponseSchema = $routingTableResponse;
var $routingQuoteTermsShape = {
  fiatCurrency: z.enum(FIAT_CURRENCY_CODES),
  fiatAmount: $decimalAmount.refine((amount) => Number(amount) > 0, "must be positive"),
  cryptoCurrencyCode: $nonBlank,
  chainId: $nonBlank,
  paymentMethodId: z.enum(PAYMENT_METHOD_CATEGORIES),
  geo: obj({ alpha2: $countryCode, region: $optionalGeoField, ip: $optionalGeoField, city: z.string().optional() }).refine(
    (geo) => hasUsRegion(geo.alpha2, geo.region),
    { message: US_REGION_REQUIRED, path: ["region"] }
  ),
  prepareSessionAuth: z.boolean().optional(),
  routingOverrides: obj({ providers: z.array($routingProvider) }).optional(),
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
};
var $routingQuoteTerms = obj($routingQuoteTermsShape);
var FiatRoutingQuoteTermsSchema = $routingQuoteTerms;
var $routingQuoteRequest = z.union([
  obj({
    ...$routingQuoteTermsShape,
    providers: z.array($routingProvider).min(1).refine((providers) => hasUniqueIds(providers), "each provider is listed once")
  }),
  obj({ ...$routingQuoteTermsShape, provider: $routingProvider })
]).refine(
  (request2) => {
    const allowed = request2.routingOverrides?.providers;
    const selected = "providers" in request2 ? request2.providers : [request2.provider];
    return allowed === void 0 || selected.every((provider) => allowed.includes(provider));
  },
  { message: "requested providers must be allowed by routingOverrides", path: ["routingOverrides"] }
);
var FiatRoutingQuoteRequestSchema = $routingQuoteRequest;
var $routingServiceableRange = obj({ min: $money, max: $money, userMax: $money.nullable().optional() });
var $noRouteFields = {
  ...$errorBodyFields,
  errorCode: z.literal("FiatNoRouteError"),
  serviceableRanges: z.array($routingServiceableRange),
  retryable: z.boolean()
};
var $routingNoRouteErrorBody = z.union([
  obj({ ...$noRouteFields, reason: z.enum(["NO_CANDIDATE", "PROVIDER_DECLINED", "PROVIDER_OUTAGE", "KYC_REJECTED"]) }),
  obj({ ...$noRouteFields, reason: z.literal("USER_LIMIT"), code: z.literal("LIMITS_EXCEEDED"), recovery: z.literal("REQUOTE") })
]);
var $amountErrorFields = { ...$errorBodyFields, fiatCurrencyCode: z.enum(FIAT_CURRENCY_CODES) };
var $routingAmountErrorBody = z.union([
  obj({ ...$amountErrorFields, errorCode: z.literal("FiatAmountBelowMinimumError"), minFiatAmount: $decimalAmount }),
  obj({ ...$amountErrorFields, errorCode: z.literal("FiatAmountAboveMaximumError"), maxFiatAmount: $decimalAmount })
]);
var $routingRateLimitedErrorBody = obj({
  ...$errorBodyFields,
  errorCode: z.literal("TooManyRequestsError"),
  retryAfterSeconds: z.number().int().positive().optional()
});
var ROUTING_ERROR_CODES = [
  "FiatNoRouteError",
  "FiatAmountBelowMinimumError",
  "FiatAmountAboveMaximumError",
  "TooManyRequestsError"
];
var $routingFaultErrorBody = obj({
  ...$errorBodyFields,
  errorCode: $nonBlank.refine((code) => !ROUTING_ERROR_CODES.includes(code), "this errorCode carries its own fields")
});
var $routingTableErrorBody = z.union([$routingRateLimitedErrorBody, $routingFaultErrorBody]);
var FiatRoutingTableErrorBodySchema = $routingTableErrorBody;
var $routingQuoteErrorBody = z.union([$routingNoRouteErrorBody, $routingAmountErrorBody, $routingFaultErrorBody]);
var FiatRoutingQuoteErrorBodySchema = $routingQuoteErrorBody;
var $fiatGeo = obj({ alpha2: z.string().regex(/^[A-Z]{2}$/), region: $nonBlank.optional(), ip: $nonBlank.optional() });
var FiatGeoSchema = $fiatGeo;
var $nextRequest = z.object({
  provider: $provider,
  action: $nonBlank,
  geo: $fiatGeo,
  destinationAsset: $destinationAsset.optional(),
  depositAddress: $nonBlank.optional()
}).catchall(z.unknown());
var FiatNextRequestSchema = $nextRequest;
var $authStartRequest = z.union([obj({ email: $nonBlank }), obj({ verificationRef: $nonBlank })]);
var FiatAuthStartRequestSchema = $authStartRequest;
var $authVerifyRequest = obj({ verificationRef: $nonBlank, otpCode: z.string().regex(/^\d{6}$/, "must be six digits") });
var FiatAuthVerifyRequestSchema = $authVerifyRequest;
var $authRefreshRequest = obj({ refreshHandle: $nonBlank });
var FiatAuthRefreshRequestSchema = $authRefreshRequest;
var $authRefreshResponse = obj({ session: $fiatSession });
var FiatAuthRefreshResponseSchema = $authRefreshResponse;
var $authRevokeRequest = obj({ refreshHandle: $nonBlank });
var FiatAuthRevokeRequestSchema = $authRevokeRequest;
var $stepResponseBase = {
  transitions: z.array($transition),
  routingSessionRef: z.string().optional(),
  providerAuthToken: obj({
    clientSecret: z.string(),
    expiresAt: z.string()
  }).optional(),
  orderId: z.string().optional(),
  refreshLimits: z.literal(true).optional()
};
var $providerBoundStepResponse = obj({
  ...$stepResponseBase,
  state: $providerBoundFlowState,
  provider: $provider,
  preparedPayment: $preparedPayment.optional(),
  handoff: obj({ provider: $provider }).optional()
}).superRefine((response, context2) => {
  if (response.preparedPayment !== void 0 && response.preparedPayment.surface.provider !== response.provider) {
    context2.addIssue({
      code: "custom",
      path: ["preparedPayment", "surface", "provider"],
      message: "preparedPayment.surface.provider must match the response provider"
    });
  }
  if (response.handoff !== void 0 && response.handoff.provider !== response.provider) {
    context2.addIssue({
      code: "custom",
      path: ["handoff", "provider"],
      message: "handoff.provider must match the response provider"
    });
  }
  if (response.handoff !== void 0 && response.state.kind !== "QUOTE") {
    context2.addIssue({
      code: "custom",
      path: ["handoff"],
      message: "only a QUOTE response hands off to a provider"
    });
  }
  if (response.handoff !== void 0 && response.transitions.length > 0) {
    context2.addIssue({
      code: "custom",
      path: ["transitions"],
      message: "a handoff response carries no transitions"
    });
  }
});
var $blockedStepResponse = obj({
  ...$stepResponseBase,
  state: $blockedState,
  provider: $provider.optional()
});
var FUN_AUTH_TRANSITIONS_BY_PHASE = {
  IDENTIFIER: ["start"],
  CODE: ["verify", "resend"],
  VERIFIED: []
};
var $funAuthStepResponse = obj({
  ...$stepResponseBase,
  state: $funAuthState,
  provider: $provider.optional(),
  session: $fiatSession.optional()
}).superRefine((response, context2) => {
  const { phase } = response.state;
  if (response.session !== void 0 && phase !== "VERIFIED") {
    context2.addIssue({ code: "custom", path: ["session"], message: "only a FUN_AUTH response in phase VERIFIED carries session" });
  }
  const allowed = FUN_AUTH_TRANSITIONS_BY_PHASE[phase];
  response.transitions.forEach((transition, index) => {
    if (!allowed.includes(transition.id)) {
      context2.addIssue({
        code: "custom",
        path: ["transitions", index, "id"],
        message: `FUN_AUTH phase ${phase} offers ${allowed.join(" or ") || "no transitions"}, not "${transition.id}"`
      });
    }
  });
});
var $stepResponse = z.union([$providerBoundStepResponse, $funAuthStepResponse, $blockedStepResponse]);
var FiatStepResponseSchema = $stepResponse;

// src/fixtures/data.ts
var FIXTURE_DATA = {
  "delivery-01-pending": {
    "state": {
      "kind": "DELIVERY",
      "state": "PENDING"
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "poll",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 18e4
        }
      }
    ]
  },
  "delivery-02-succeeded": {
    "state": {
      "kind": "DELIVERY",
      "state": "SUCCEEDED",
      "txHash": "5VER\u2026"
    },
    "provider": "MOONPAY",
    "transitions": []
  },
  "delivery-03-failed": {
    "state": {
      "kind": "DELIVERY",
      "state": "FAILED"
    },
    "provider": "MOONPAY",
    "transitions": []
  },
  "fun-auth-01-identifier": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "IDENTIFIER",
      "error": {
        "category": "USER_ERROR",
        "retryable": true,
        "recovery": "NONE",
        "code": "INVALID_EMAIL"
      }
    },
    "transitions": [
      {
        "id": "start",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth",
        "inputs": {
          "email": {
            "type": "TEXT"
          }
        }
      }
    ]
  },
  "fun-auth-02-code": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "CODE",
      "expiresAtMs": 17600006e5,
      "resendAvailableAtMs": 176000006e4,
      "attemptsRemaining": 3
    },
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth/verify",
        "params": {
          "verificationRef": "vr_7c1"
        },
        "inputs": {
          "otpCode": {
            "type": "TEXT",
            "length": 6,
            "regex": "^\\d{6}$"
          }
        }
      },
      {
        "id": "resend",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/auth",
        "params": {
          "verificationRef": "vr_7c1"
        }
      }
    ]
  },
  "fun-auth-03-verified": {
    "state": {
      "kind": "FUN_AUTH",
      "channel": "EMAIL_OTP",
      "phase": "VERIFIED"
    },
    "transitions": [],
    "session": {
      "accessToken": "<access-token>",
      "refreshHandle": "<refresh-handle>",
      "expiresAtMs": 176e10
    }
  },
  "screen-01-quote": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "500.00"
          },
          {
            "min": "1000.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "continue",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-01b-quote-with-pay-sheet": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "surface": {
        "kind": "PAY_SHEET",
        "provider": "TRANSAK",
        "params": {
          "sessionId": "txs_\u2026",
          "environment": "STAGING"
        }
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/orders",
          "params": {
            "quoteRef": "q_8f2",
            "depositAddress": "\u2026"
          },
          "expects": [
            "paymentAuthorisationId"
          ]
        }
      }
    ]
  },
  "screen-02-session-auth": {
    "state": {
      "kind": "SESSION_AUTH",
      "channel": "EMAIL_OTP"
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session/verify",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "code": {
            "type": "TEXT",
            "length": 6
          }
        }
      }
    ]
  },
  "screen-03-kyc-input-required": {
    "state": {
      "kind": "KYC",
      "phase": "INPUT_REQUIRED",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "form": {
        "formId": "kyc_q_8f2_1",
        "fields": [
          {
            "id": "TAX_IDENTIFIER",
            "type": "TEXT",
            "labelFallback": "Tax ID",
            "required": true
          },
          {
            "id": "RESIDENTIAL_ADDRESS_LINE_1",
            "type": "TEXT",
            "labelFallback": "Home address",
            "required": true
          }
        ]
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "submit_round",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/kyc/form",
        "params": {
          "quoteRef": "q_8f2",
          "formId": "kyc_q_8f2_1"
        },
        "inputs": {
          "values": {
            "type": "FORM_VALUES"
          }
        }
      }
    ]
  },
  "screen-04-order-review": {
    "state": {
      "kind": "ORDER",
      "phase": "AWAITING_CONFIRMATION",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "confirm",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-05-payment-capture": {
    "state": {
      "kind": "PAYMENT",
      "phase": "CAPTURE",
      "surface": {
        "kind": "PCI_COMPONENT",
        "provider": "TRANSAK",
        "params": {
          "sessionId": "eyJ\u2026",
          "environment": "STAGING"
        }
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/orders",
          "params": {
            "quoteRef": "q_8f2"
          },
          "expects": [
            "requestId"
          ]
        }
      }
    ]
  },
  "screen-07b-order-created-delivery": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "USD",
          "amount": "50.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "base",
          "amount": "48.73"
        },
        "method": "apple_pay",
        "createdAt": "\u2026"
      },
      "status": "PROCESSING"
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "delivery",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 9e5
        }
      }
    ]
  },
  "screen-08-kyc-capture": {
    "state": {
      "kind": "KYC",
      "phase": "CAPTURE",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "surface": {
        "kind": "KYC_SDK",
        "provider": "SUMSUB",
        "params": {
          "accessToken": "eyJ\u2026"
        },
        "preferredDocuments": {
          "IDENTITY": {
            "idDocType": "PASSPORT",
            "country": "GBR"
          }
        },
        "expiresAt": "\u2026"
      },
      "correctionReason": "The image is too blurry. Upload a clearer photo of this document."
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "refresh_sdk_token",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/kyc/sdk-token",
        "params": {
          "quoteRef": "q_8f2"
        },
        "labelFallback": "Retry verification"
      },
      {
        "id": "capture",
        "mode": "CLIENT_SURFACE",
        "report": {
          "endpoint": "POST /fiat/kyc/capture",
          "params": {
            "quoteRef": "q_8f2"
          },
          "result": {
            "type": "KYC_SDK_RESULT",
            "bodyKey": "result"
          }
        }
      }
    ]
  },
  "screen-09-kyc-in-review": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "IN_REVIEW",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "poll",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/quotes/q_8f2",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 9e4
        }
      }
    ]
  },
  "screen-10-kyc-on-hold": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "ON_HOLD",
      "retryAfter": "2026-08-20T09:00:00Z",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-11-kyc-rejected": {
    "state": {
      "kind": "KYC",
      "phase": "NO_ACTION_REQUIRED",
      "reason": "REJECTED",
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.59"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "\u2026"
      },
      "failureReason": {
        "category": "KYC_REJECTED",
        "retryable": false,
        "recovery": "CONTACT_SUPPORT"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-12-pending-order": {
    "state": {
      "kind": "PENDING_ORDER",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "method": "bank_transfer",
        "createdAt": "\u2026",
        "status": "AWAITING_PAYMENT"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "resume",
        "mode": "SUBMIT",
        "endpoint": "GET /fiat/orders/o_31c"
      },
      {
        "id": "cancel",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders/o_31c/cancel"
      }
    ]
  },
  "screen-13-order-settled": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "method": "card",
        "instrument": {
          "brandLabel": "Chase Debit",
          "last4": "4021"
        },
        "createdAt": "\u2026"
      },
      "status": "SETTLED",
      "tx": {
        "chainId": 137,
        "hash": "0x\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-13b-order-settled-converted": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "USD",
          "amount": "50.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "base",
          "amount": "48.73"
        },
        "method": "apple_pay",
        "createdAt": "\u2026"
      },
      "status": "SETTLED",
      "tx": {
        "chainId": 8453,
        "hash": "0x\u2026"
      }
    },
    "provider": "MOONPAY",
    "transitions": [
      {
        "id": "delivery",
        "mode": "AWAIT",
        "poll": {
          "endpoint": "GET /fiat/delivery/dlv_31c",
          "intervalMs": 3e3,
          "backoffFactor": 1.5,
          "maxIntervalMs": 1e4,
          "giveUpAfterMs": 6e5
        }
      }
    ]
  },
  "screen-14-order-failed": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "method": "card",
        "createdAt": "\u2026"
      },
      "status": "FAILED",
      "failureReason": {
        "category": "PAYMENT_DECLINED",
        "retryable": true,
        "recovery": "RETRY_PAYMENT"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "retry_payment",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders",
        "params": {
          "quoteRef": "q_8f2"
        }
      }
    ]
  },
  "screen-15-order-refunded": {
    "state": {
      "kind": "ORDER",
      "phase": "CREATED",
      "order": {
        "orderId": "o_31c",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "method": "bank_transfer",
        "createdAt": "\u2026"
      },
      "status": "REFUNDED",
      "refund": {
        "currency": "GBP",
        "amount": "100.00",
        "expectedBy": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": []
  },
  "screen-16-blocked": {
    "state": {
      "kind": "BLOCKED",
      "reason": "REGION_UNSUPPORTED",
      "retryAfter": null
    },
    "transitions": []
  },
  "worked-example-01-quote": {
    "state": {
      "kind": "QUOTE",
      "limits": {
        "min": "1.00",
        "max": "3000.00",
        "serviceableRanges": [
          {
            "min": "1.00",
            "max": "3000.00"
          }
        ]
      },
      "quote": {
        "quoteRef": "q_8f2",
        "fiat": {
          "currency": "GBP",
          "amount": "100.00"
        },
        "crypto": {
          "currency": "USDC",
          "network": "polygon",
          "amount": "98.41"
        },
        "rate": "0.9841",
        "totalFee": "1.59",
        "feeBreakdown": [
          {
            "id": "provider_fee",
            "labelFallback": "Processing fee",
            "amount": "1.09"
          },
          {
            "id": "network_fee",
            "labelFallback": "Network fee",
            "amount": "0.50"
          }
        ],
        "paymentMethod": "bank_transfer",
        "expiresAt": "2026-08-11T21:33:00Z"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "continue",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "email": {
            "type": "TEXT"
          }
        }
      }
    ]
  },
  "worked-example-02-session-auth": {
    "state": {
      "kind": "SESSION_AUTH",
      "channel": "EMAIL_OTP"
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "verify",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/session/verify",
        "params": {
          "quoteRef": "q_8f2"
        },
        "inputs": {
          "code": {
            "type": "TEXT",
            "length": 6
          }
        }
      }
    ]
  },
  "worked-example-04-payment-instruct": {
    "orderId": "o_3d1",
    "state": {
      "kind": "PAYMENT",
      "phase": "INSTRUCT",
      "instructions": {
        "kind": "BANK_FIELDS",
        "fields": [
          {
            "id": "beneficiary",
            "labelFallback": "Beneficiary",
            "value": "Transak"
          },
          {
            "id": "sort_code",
            "labelFallback": "Sort code",
            "value": "04-00-04"
          },
          {
            "id": "account_number",
            "labelFallback": "Account number",
            "value": "12345678"
          },
          {
            "id": "reference",
            "labelFallback": "Reference",
            "value": "o_3d1"
          }
        ],
        "expiresAt": "\u2026"
      }
    },
    "provider": "TRANSAK",
    "transitions": [
      {
        "id": "confirm_paid",
        "mode": "SUBMIT",
        "endpoint": "POST /fiat/orders/o_3d1/confirm-payment"
      }
    ]
  }
};

// src/fixtures/index.ts
var FIXTURES = [
  {
    id: "screen-01-quote",
    file: "screen-01-quote.json",
    source: "FE_DOC",
    docRef: "Screen 1 \xB7 Quote / review",
    screen: 1,
    stateKey: "QUOTE"
  },
  {
    id: "screen-01b-quote-with-pay-sheet",
    file: "screen-01b-quote-with-pay-sheet.json",
    source: "CONTRACT_DOC",
    docRef: "Fiat Contract 0.7 \xA7The contract diff \xB7 example envelopes",
    screen: 1,
    stateKey: "QUOTE",
    notes: [
      "The 0.7 single-screen shape: the quote carries its own PAY_SHEET, so the provider component is the primary CTA rather than something a later state reveals.",
      "Quote payload is screen-01-quote verbatim; only the surface and the transition differ."
    ]
  },
  {
    id: "screen-02-session-auth",
    file: "screen-02-session-auth.json",
    source: "FE_DOC",
    docRef: "Screen 2 \xB7 Verification code (OTP)",
    screen: 2,
    stateKey: "SESSION_AUTH"
  },
  {
    id: "fun-auth-01-identifier",
    file: "fun-auth-01-identifier.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: [
      "The server re-asks for the email after a start that failed with a user-correctable error. The first IDENTIFIER is entered client-side.",
      "No provider: FUN_AUTH runs before any provider is chosen."
    ]
  },
  {
    id: "fun-auth-02-code",
    file: "fun-auth-02-code.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: ["verify and resend carry the same verificationRef; resend is usable once resendAvailableAtMs has passed."]
  },
  {
    id: "fun-auth-03-verified",
    file: "fun-auth-03-verified.json",
    source: "IDENTITY_DOC",
    docRef: "Fiat identity design doc (2026-10-20) \xB7 Contract changes",
    stateKey: "FUN_AUTH",
    notes: [
      "A Fun-run login: the envelope carries the Fun session and no transitions. The SDK then starts the flow at QUOTE with accessToken as Bearer.",
      "accessToken and refreshHandle are placeholders."
    ]
  },
  {
    id: "screen-03-kyc-input-required",
    file: "screen-03-kyc-input-required.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 L1 input round",
    screen: 3,
    stateKey: "KYC/INPUT_REQUIRED",
    notes: ["Carries the FORM_VALUES input spec \u2014 the no-double-carry case of the accepted split."]
  },
  {
    id: "screen-04-order-review",
    file: "screen-04-order-review.json",
    source: "FE_DOC",
    docRef: "Screen 4 \xB7 Order review (bank rail)",
    screen: 4,
    stateKey: "ORDER/AWAITING_CONFIRMATION",
    notes: [
      `The screen card publishes this payload by reference \u2014 "quote: <same shape as Screen 1, refreshed>" \u2014 so the quote here is Screen 1's payload verbatim. The numbers are not re-published as refreshed values, so they are unchanged; only the shape is contractual.`
    ]
  },
  {
    id: "screen-05-payment-capture",
    file: "screen-05-payment-capture.json",
    source: "FE_DOC",
    docRef: "Screen 5 \xB7 Card payment",
    screen: 5,
    stateKey: "PAYMENT/CAPTURE",
    notes: [
      "Capture-then-order topology (report \u2192 POST /fiat/orders, expects requestId).",
      "TODO(open-decision): report target per card topology is a Transak ask (contract Flow A)."
    ]
  },
  {
    id: "screen-08-kyc-capture",
    file: "screen-08-kyc-capture.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 embedded Sumsub WebSDK",
    screen: 8,
    stateKey: "KYC/CAPTURE",
    notes: [
      "The client mounts the Sumsub adapter; no URL or iframe is emitted.",
      "A retry may carry provider-authored correctionReason display text; clients never branch on it."
    ]
  },
  {
    id: "screen-09-kyc-in-review",
    file: "screen-09-kyc-in-review.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 pending quote",
    screen: 9,
    stateKey: "KYC/NO_ACTION_REQUIRED:IN_REVIEW"
  },
  {
    id: "screen-10-kyc-on-hold",
    file: "screen-10-kyc-on-hold.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 verification on hold",
    screen: 10,
    stateKey: "KYC/NO_ACTION_REQUIRED:ON_HOLD",
    notes: ["transitions: [] and NOT terminal \u2014 the fixture that proves terminality is table data."]
  },
  {
    id: "screen-11-kyc-rejected",
    file: "screen-11-kyc-rejected.json",
    source: "KYC_DOC",
    docRef: "Fiat KYC \xB7 non-retryable rejection",
    screen: 11,
    stateKey: "KYC/NO_ACTION_REQUIRED:REJECTED",
    notes: ["Only an explicit non-retryable provider or identity-vendor outcome reaches this state."]
  },
  {
    id: "screen-12-pending-order",
    file: "screen-12-pending-order.json",
    source: "FE_DOC",
    docRef: "Screen 12 \xB7 Order in progress",
    screen: 12,
    stateKey: "PENDING_ORDER",
    notes: [
      "TODO(open-decision): PENDING_ORDER removal proposed; Screen 12 frozen. Kept so 0.1.0 can validate the current shape."
    ]
  },
  {
    id: "screen-13-order-settled",
    file: "screen-13-order-settled.json",
    source: "FE_DOC",
    docRef: "Screen 13 \xB7 Success",
    screen: 13,
    stateKey: "ORDER/CREATED"
  },
  {
    id: "screen-07b-order-created-delivery",
    file: "screen-07b-order-created-delivery.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 an order whose request carried a destinationAsset",
    screen: 7,
    stateKey: "ORDER/CREATED",
    notes: [
      "Offered from creation: the request carried a destinationAsset, so the order offers delivery and no poll. The client polls only GET /fiat/delivery/:deliveryId from here, within one 15-minute window from the order's creation (giveUpAfterMs)."
    ]
  },
  {
    id: "screen-13b-order-settled-converted",
    file: "screen-13b-order-settled-converted.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 a destinationAsset order at SETTLED",
    screen: 13,
    stateKey: "ORDER/CREATED",
    notes: [
      "The order body is the fiat leg only. The backend offers the delivery transition because the request carried a destinationAsset (from creation, so also at SETTLED); the client follows it instead of showing success."
    ]
  },
  {
    id: "screen-14-order-failed",
    file: "screen-14-order-failed.json",
    source: "FE_DOC",
    docRef: "Screen 14 \xB7 Something went wrong",
    screen: 14,
    stateKey: "ORDER/CREATED",
    notes: ["Terminal status (FAILED) still carrying a recovery transition \u2014 retryable failureReason."]
  },
  {
    id: "screen-15-order-refunded",
    file: "screen-15-order-refunded.json",
    source: "FE_DOC",
    docRef: "Screen 15 \xB7 Refund on the way",
    screen: 15,
    stateKey: "ORDER/CREATED"
  },
  {
    id: "screen-16-blocked",
    file: "screen-16-blocked.json",
    source: "FE_DOC",
    docRef: "Screen 16 \xB7 Not available",
    screen: 16,
    stateKey: "BLOCKED",
    notes: ["A flatly terminal availability state; explicit non-retryable KYC rejection is terminal too."]
  },
  {
    id: "worked-example-01-quote",
    file: "worked-example-01-quote.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, step 1 (method selection)",
    stateKey: "QUOTE",
    notes: ["Carries inputs {email: {type: TEXT}} \u2014 the collected-spec half of the split."]
  },
  {
    id: "worked-example-02-session-auth",
    file: "worked-example-02-session-auth.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, step 2 (session challenge)",
    stateKey: "SESSION_AUTH"
  },
  {
    id: "worked-example-04-payment-instruct",
    file: "worked-example-04-payment-instruct.json",
    source: "CONTRACT_DOC",
    docRef: "\xA7Worked example, steps 4\u20135 (order + bank instructions)",
    stateKey: "PAYMENT/INSTRUCT",
    notes: [
      "The response-level `orderId` case. TODO(open-decision): orderId placement (beside `state` here vs inside it in the FE doc v0)."
    ]
  },
  {
    id: "delivery-01-pending",
    file: "delivery-01-pending.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the purchase is running",
    stateKey: "DELIVERY:PENDING",
    notes: [
      "giveUpAfterMs is what is left of the one 15-minute window that started when the order was created (here 12 minutes later), so the window never restarts."
    ]
  },
  {
    id: "delivery-02-succeeded",
    file: "delivery-02-succeeded.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the destination asset reached the user",
    stateKey: "DELIVERY:SUCCEEDED"
  },
  {
    id: "delivery-03-failed",
    file: "delivery-03-failed.json",
    source: "CONTRACT_DOC",
    docRef: "Package README \xA7Delivery \xB7 the purchase failed",
    stateKey: "DELIVERY:FAILED",
    notes: [
      "No transition, whichever leg failed: the client offers no new payment from it. When the buyer paid, support recovers the funds."
    ]
  }
];
var FIXTURE_COVERAGE_GAPS = [];
var fixtureMeta = (id) => {
  const meta = FIXTURES.find((f) => f.id === id);
  if (!meta) throw new Error(`unknown fixture: ${id}`);
  return meta;
};
function loadFixture(id) {
  const meta = fixtureMeta(id);
  const data = FIXTURE_DATA[meta.id];
  if (data === void 0) throw new Error(`fixture data missing for ${meta.id} \u2014 run npm run generate:fixtures`);
  return JSON.parse(JSON.stringify(data));
}
function loadFixtures() {
  return FIXTURES.map((meta) => ({ meta, json: loadFixture(meta.id) }));
}

// src/assert.ts
var ContractViolation = class extends Error {
  issues;
  constructor(message, issues = []) {
    super(issues.length ? `${message}
  - ${issues.join("\n  - ")}` : message);
    this.name = "ContractViolation";
    this.issues = issues;
  }
};
var formatIssues = (error) => {
  const issues = error.issues;
  if (!issues) return [String(error)];
  return issues.map((issue) => {
    const path = (issue.path ?? []).join(".");
    return path ? `${path}: ${issue.message ?? "invalid"}` : issue.message ?? "invalid";
  });
};
function assertFiatStepResponse(json) {
  const result = FiatStepResponseSchema.safeParse(json);
  if (!result.success) throw new ContractViolation("invalid fiat step response", formatIssues(result.error));
  return result.data;
}
function endpointMatches(template, actual) {
  const pattern = template.split("/").map((segment) => segment.startsWith(":") ? "[^/]+" : escapeRegExp(segment)).join("/");
  return new RegExp(`^${pattern}$`).test(actual);
}
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var transitionEndpoint = (transition) => {
  switch (transition.mode) {
    case "SUBMIT":
      return transition.endpoint;
    case "AWAIT":
      return transition.poll.endpoint;
    case "CLIENT_SURFACE":
      return transition.report.endpoint;
  }
};
var matchesAllowed = (transition, allowed) => allowed.mode === transition.mode && endpointMatches(allowed.endpoint, transitionEndpoint(transition));
function bodyKeyIssues(transition) {
  const issues = [];
  const collide = (a, b, left, right) => {
    for (const key of a) {
      if (b.includes(key)) issues.push(`transition "${transition.id}": key "${key}" is in both ${left} and ${right}`);
    }
  };
  if (transition.mode === "SUBMIT") {
    const params = Object.keys(transition.params ?? {});
    const inputs = Object.keys(transition.inputs ?? {});
    collide(params, inputs, "params", "inputs");
    for (const [key, value] of Object.entries(transition.params ?? {})) {
      if (looksLikeFieldSpec(value)) {
        issues.push(
          `transition "${transition.id}": params.${key} is FieldSpec-shaped \u2014 a spec the client must collect belongs in inputs`
        );
      }
    }
  }
  if (transition.mode === "CLIENT_SURFACE") {
    const params = Object.keys(transition.report.params ?? {});
    collide(params, transition.report.expects ?? [], "report.params", "report.expects");
    const resultKeys = transition.report.result ? [transition.report.result.bodyKey] : [];
    collide(params, resultKeys, "report.params", "report.result");
    collide(transition.report.expects ?? [], resultKeys, "report.expects", "report.result");
  }
  return issues;
}
function checkLegalEmission(state, transitions) {
  const entry = tableEntry(state);
  const issues = [];
  if (entry.terminal && transitions.length > 0) {
    issues.push(
      `${entry.key} is terminal (table) and must carry transitions: [] \u2014 got ${transitions.length}`
    );
  }
  const surfaceTargets = new Set(
    transitions.filter((t) => t.mode === "CLIENT_SURFACE").map((t) => t.report.endpoint)
  );
  for (const transition of transitions) {
    if (transition.mode === "SUBMIT" && surfaceTargets.has(transition.endpoint)) {
      issues.push(
        `transition "${transition.id}": SUBMIT ${transition.endpoint} coexists with a CLIENT_SURFACE reporting to it`
      );
    }
  }
  for (const transition of transitions) {
    issues.push(...bodyKeyIssues(transition));
    if (transition.mode === "CLIENT_SURFACE" && !("surface" in state)) {
      issues.push(
        `transition "${transition.id}": CLIENT_SURFACE requires the Surface in state (\u03942 single-carry) \u2014 ${entry.key} carries none`
      );
    }
    if (transition.mode === "CLIENT_SURFACE" && transition.report.result?.type === "KYC_SDK_RESULT" && (!("surface" in state) || state.surface?.kind !== "KYC_SDK")) {
      issues.push(
        `transition "${transition.id}": KYC_SDK_RESULT requires a KYC_SDK surface in state`
      );
    }
    if (transition.mode === "SUBMIT" && Object.values(transition.inputs ?? {}).some((spec) => spec.type === "FORM_VALUES") && !("form" in state)) {
      issues.push(
        `transition "${transition.id}": inputs {type: FORM_VALUES} collects state.form \u2014 ${entry.key} carries no form`
      );
    }
    if (entry.docStatus === "SPECIFIED" && !entry.allowedTransitions.some((a) => matchesAllowed(transition, a))) {
      issues.push(
        `transition "${transition.id}": ${transition.mode} ${transitionEndpoint(transition)} is not in ${entry.key}'s legal set (${entry.allowedTransitions.map((a) => `${a.mode} ${a.endpoint}`).join(" | ") || "none"})`
      );
    }
  }
  return {
    state: entry.key,
    issues,
    unjudgeable: entry.docStatus === "UNSPECIFIED"
  };
}
function assertLegalEmission(state, transitions) {
  const { issues, state: key } = checkLegalEmission(state, transitions);
  if (issues.length) throw new ContractViolation(`illegal emission for ${key}`, issues);
}
function assertLegalReturn(from, to) {
  const entry = tableEntry(from);
  const target = stateKey(to);
  if (!entry.mayReturn) return;
  if (!entry.mayReturn.includes(target)) {
    throw new ContractViolation(
      `illegal return: ${entry.key} \u2192 ${target}`,
      [`${entry.key} may receive back: ${entry.mayReturn.join(" \xB7 ") || "nothing (terminal)"}`]
    );
  }
}
function walkTable(fn) {
  return STATE_KEYS.map((key) => fn(TRANSITION_TABLE[key], key));
}
function assertFixture(id) {
  const meta = fixtureMeta(id);
  const json = loadFixture(id);
  const stepResponse2 = assertFiatStepResponse(json);
  if (stateKey(stepResponse2.state) !== meta.stateKey) {
    throw new ContractViolation(
      `fixture ${id}: manifest says ${meta.stateKey}, step response carries ${stateKey(stepResponse2.state)}`
    );
  }
  assertLegalEmission(stepResponse2.state, stepResponse2.transitions);
  return { meta, stepResponse: stepResponse2 };
}
function assertAllFixtures() {
  return FIXTURES.map((meta) => assertFixture(meta.id));
}

// src/providers/moonpay.schemas.ts
import { z as z2 } from "zod";
var FIAT_CURRENCY_CODES2 = Object.keys(FIAT_CURRENCY_NAMES);
var obj2 = (shape) => z2.object(shape).strict();
var $nonEmpty = z2.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds2 = (ids) => new Set(ids).size === ids.length;
var $checkout = obj2({
  amount: FiatAmountSchema,
  destination: obj2({ asset: $nonEmpty, network: $nonEmpty }),
  paymentMethod: z2.literal("apple_pay")
});
var MoonPayCheckoutSchema = $checkout;
var $credentials = obj2({ customerId: $nonEmpty, accessToken: $nonEmpty });
var MoonPaySdkCredentialsSchema = $credentials;
var $context = {
  checkout: $checkout,
  credentials: $credentials.optional(),
  destinationAsset: DestinationAssetSchema.optional()
};
var $requestContext = obj2($context);
var MoonPayRequestContextSchema = $requestContext;
var $quoteInput = obj2({
  source: obj2({ asset: obj2({ code: z2.enum(FIAT_CURRENCY_CODES2) }), amount: $nonEmpty }),
  destination: obj2({ asset: obj2({ code: $nonEmpty }) }),
  wallet: obj2({ address: $nonEmpty }),
  paymentMethod: obj2({ type: z2.literal("apple_pay") }),
  feeBehavior: z2.literal("inclusive")
});
var MoonPayQuoteInputSchema = $quoteInput;
var $observeFields = { action: z2.literal("observe") };
var $consentFields = {
  action: z2.literal("consent"),
  acceptances: z2.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds2(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
};
var $sessionFields = { action: z2.literal("session") };
var $connectFields = { action: z2.literal("connect"), customerId: $nonEmpty, accessToken: $nonEmpty };
var $phoneNumberFields = { action: z2.literal("phone"), phoneNumber: z2.string().regex(/^\+[1-9]\d{1,14}$/) };
var $phoneResendFields = { action: z2.literal("phone"), resend: $nonEmpty };
var $phoneCodeFields = { action: z2.literal("phoneCode"), verificationRef: $nonEmpty, otpCode: z2.string().regex(/^\d{6}$/) };
var $guestDeclineReason = z2.enum(["NOT_OFFERED", "MISMATCH", "OVER_LIMIT"]);
var MoonPayGuestDeclineReasonSchema = $guestDeclineReason;
var $declineFields = { action: z2.literal("decline"), reason: $guestDeclineReason };
var $kycFields = {
  action: z2.literal("kyc"),
  credentials: $credentials,
  values: z2.record(KycFieldIdSchema, z2.string())
};
var $prepareCaptureFields = { action: z2.literal("prepareCapture"), credentials: $credentials };
var $captureFields = { action: z2.literal("capture"), credentials: $credentials, result: KycSdkResultReportSchema };
var $orderFields = { action: z2.literal("order"), orderId: $nonEmpty, quotedAmount: FiatAmountSchema, transactionId: $nonEmpty.optional() };
var $observeRequest = obj2({ ...$context, ...$observeFields });
var $consentRequest = obj2({ ...$context, ...$consentFields });
var $sessionRequest = obj2({ ...$context, ...$sessionFields });
var $connectRequest = obj2({ ...$context, ...$connectFields });
var $phoneRequest = z2.union([obj2({ ...$context, ...$phoneNumberFields }), obj2({ ...$context, ...$phoneResendFields })]);
var $phoneCodeRequest = obj2({ ...$context, ...$phoneCodeFields });
var $declineRequest = obj2({ ...$context, ...$declineFields });
var $kycRequest = obj2({ ...$context, ...$kycFields });
var $prepareCaptureRequest = obj2({ ...$context, ...$prepareCaptureFields });
var $captureRequest = obj2({ ...$context, ...$captureFields });
var $orderRequest = obj2({ ...$context, ...$orderFields });
var MoonPayObserveRequestSchema = $observeRequest;
var MoonPayConsentRequestSchema = $consentRequest;
var MoonPaySessionRequestSchema = $sessionRequest;
var MoonPayConnectRequestSchema = $connectRequest;
var MoonPayPhoneRequestSchema = $phoneRequest;
var MoonPayPhoneCodeRequestSchema = $phoneCodeRequest;
var MoonPayDeclineRequestSchema = $declineRequest;
var MoonPayKycRequestSchema = $kycRequest;
var MoonPayPrepareCaptureRequestSchema = $prepareCaptureRequest;
var MoonPayCaptureRequestSchema = $captureRequest;
var MoonPayOrderRequestSchema = $orderRequest;
var $request = z2.union([
  $observeRequest,
  $consentRequest,
  $sessionRequest,
  $connectRequest,
  $kycRequest,
  $prepareCaptureRequest,
  $captureRequest,
  $orderRequest
]);
var MoonPayRequestSchema = $request;
var $envelope = { provider: z2.literal("MOONPAY"), geo: FiatGeoSchema, depositAddress: $nonEmpty.optional(), ...$context };
var $nextRequest2 = z2.union([
  obj2({ ...$envelope, ...$observeFields }),
  obj2({ ...$envelope, ...$consentFields }),
  obj2({ ...$envelope, ...$sessionFields }),
  obj2({ ...$envelope, ...$connectFields }),
  obj2({ ...$envelope, ...$kycFields }),
  obj2({ ...$envelope, ...$prepareCaptureFields }),
  obj2({ ...$envelope, ...$captureFields }),
  obj2({ ...$envelope, ...$orderFields })
]);
var MoonPayNextRequestSchema = $nextRequest2;
var FIELD_OF_CODE = { PHONE_IN_USE: "PHONE_NUMBER", TAX_ID_IN_USE: "TAX_IDENTIFIER" };
var $fieldError = obj2({ fieldId: $nonEmpty, message: $nonEmpty, code: z2.enum(["PHONE_IN_USE", "TAX_ID_IN_USE"]).optional() });
var $consentShape = obj2({ next: z2.literal("consent"), documents: z2.array(TermsDocumentSchema).min(1) });
var $sessionNextAction = obj2({ next: z2.literal("session") });
var $connectNextAction = obj2({
  next: z2.literal("connect"),
  sessionToken: $nonEmpty,
  quoteInput: $quoteInput,
  resetConnection: z2.literal(true).optional()
});
var $phoneNextAction = obj2({ next: z2.literal("phone"), error: z2.literal("CODE_EXPIRED").nullable() });
var $phoneCodeNextAction = obj2({
  next: z2.literal("phoneCode"),
  verificationRef: $nonEmpty,
  expiresAt: z2.string().datetime({ offset: true }),
  error: z2.literal("CODE_INVALID").nullable()
});
var $payNextAction = obj2({ next: z2.literal("pay"), sessionToken: $nonEmpty, orderId: $nonEmpty, quoteInput: $quoteInput });
var CAPTURE_DOCUMENTS = ["IDENTITY_DOCUMENT", "SELFIE", "PROOF_OF_ADDRESS", "PROOF_OF_INCOME"];
var $captureDocument = z2.enum(CAPTURE_DOCUMENTS);
var $reaskRequirement = z2.union([KycFieldIdSchema, $captureDocument]);
var $reaskReason = z2.enum(["EXPIRED", "POOR_QUALITY", "MISMATCH", "REJECTED"]);
var $reask = obj2({
  requirements: z2.array($reaskRequirement).min(1).refine(hasUniqueIds2, "requirements must be unique"),
  reason: $reaskReason.nullable()
});
var $kycShape = obj2({
  next: z2.literal("kyc"),
  fields: z2.array(FormFieldSchema),
  fieldErrors: z2.array($fieldError).min(1).optional(),
  reask: $reask.nullable()
});
var $prepareCaptureNextAction = obj2({ next: z2.literal("prepareCapture") });
var $captureShape = obj2({
  next: z2.literal("capture"),
  kycProvider: KYCProviderSchema,
  accessToken: $nonEmpty,
  expiresAt: z2.string().datetime({ offset: true }),
  reask: $reask.nullable()
});
var $waitNextAction = obj2({ next: z2.literal("wait"), retryAfterMs: z2.number().int().positive().max(6e4) });
var $orderNextAction = obj2({ next: z2.literal("order"), orderId: $nonEmpty, quoteInput: $quoteInput });
var $orderPendingNextAction = obj2({
  next: z2.literal("orderPending"),
  orderId: $nonEmpty,
  retryAfterMs: z2.number().int().positive().max(6e4),
  order: FiatStepResponseSchema.nullable()
});
var checkConsent = (nextAction, context2) => {
  if (!hasUniqueIds2(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds2(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.fieldErrors?.some((error) => error.code && FIELD_OF_CODE[error.code] !== error.fieldId)) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error code must match its field" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
};
var isCaptureDocument = (requirement) => CAPTURE_DOCUMENTS.includes(requirement);
var checkCapture = (nextAction, context2) => {
  if (nextAction.reask?.requirements.some((requirement) => !isCaptureDocument(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a capture reask must name documents only" });
  }
};
var MoonPayConsentNextActionSchema = $consentShape.superRefine(checkConsent);
var MoonPaySessionNextActionSchema = $sessionNextAction;
var MoonPayConnectNextActionSchema = $connectNextAction;
var MoonPayPhoneNextActionSchema = $phoneNextAction;
var MoonPayPhoneCodeNextActionSchema = $phoneCodeNextAction;
var MoonPayPayNextActionSchema = $payNextAction;
var MoonPayKycNextActionSchema = $kycShape.superRefine(checkKyc);
var MoonPayPrepareCaptureNextActionSchema = $prepareCaptureNextAction;
var MoonPayCaptureDocumentSchema = $captureDocument;
var MoonPayReaskRequirementSchema = $reaskRequirement;
var MoonPayReaskReasonSchema = $reaskReason;
var MoonPayReaskSchema = $reask;
var MoonPayCaptureNextActionSchema = $captureShape.superRefine(checkCapture);
var MoonPayWaitNextActionSchema = $waitNextAction;
var MoonPayOrderNextActionSchema = $orderNextAction;
var MoonPayOrderPendingNextActionSchema = $orderPendingNextAction;
var checkNextAction = (response, context2) => {
  if (response.next === "consent") checkConsent(response, context2);
  if (response.next === "kyc") checkKyc(response, context2);
  if (response.next === "capture") checkCapture(response, context2);
};
var $nextActionOptions = [
  $consentShape,
  $sessionNextAction,
  $connectNextAction,
  $kycShape,
  $prepareCaptureNextAction,
  $captureShape,
  $waitNextAction,
  $orderNextAction
];
var $nextAction = z2.discriminatedUnion("next", [...$nextActionOptions]).superRefine(checkNextAction);
var MoonPayNextActionSchema = $nextAction;
var $done = obj2({ next: z2.literal("done"), order: FiatStepResponseSchema });
var MoonPayDoneSchema = $done;
var $stepRefused = obj2({
  next: z2.literal("refused"),
  reason: z2.enum(["NOT_ELIGIBLE", "DOCUMENTS_REQUIRED", "FINAL_REJECTION", "CUSTOMER_MISMATCH"]),
  recovery: z2.enum(["REQUOTE", "NONE"])
});
var $orderRefused = obj2({
  next: z2.literal("refused"),
  reason: z2.enum(["CUSTOMER_MISMATCH", "WALLET_MISMATCH", "UNRECORDABLE"]),
  recovery: z2.literal("NONE")
});
var $stepResponse2 = z2.discriminatedUnion("next", [...$nextActionOptions, $stepRefused]).superRefine(checkNextAction);
var MoonPayStepResponseSchema = $stepResponse2;
var $orderResponse = z2.discriminatedUnion("next", [$done, $orderNextAction, $orderPendingNextAction, $orderRefused]);
var MoonPayOrderResponseSchema = $orderResponse;
var MoonPayResponseSchemaFor = {
  observe: MoonPayStepResponseSchema,
  consent: MoonPayStepResponseSchema,
  session: MoonPayStepResponseSchema,
  connect: MoonPayStepResponseSchema,
  kyc: MoonPayStepResponseSchema,
  prepareCapture: MoonPayStepResponseSchema,
  capture: MoonPayStepResponseSchema,
  order: MoonPayOrderResponseSchema
};
var $faultFields = {
  reason: z2.enum([
    "SESSION_BUDGET_SPENT",
    "RATE_LIMITED",
    "PROVIDER_UNAVAILABLE",
    "KYC_PROVIDER_UNAVAILABLE",
    "SERVICE_UNAVAILABLE",
    "INVALID_REQUEST"
  ]),
  recovery: z2.enum(["RETRY", "REQUOTE", "NONE"])
};
var $fault = obj2($faultFields);
var MoonPayFaultSchema = $fault;
var $errorBody = obj2({ ...$faultFields, errorCode: $nonEmpty, errorMsg: z2.string(), reqId: z2.string().optional() });
var MoonPayErrorBodySchema = $errorBody;

// src/providers/coinbase.schemas.ts
import { z as z3 } from "zod";
var obj3 = (shape) => z3.object(shape).strict();
var $nonEmpty2 = z3.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds3 = (ids) => new Set(ids).size === ids.length;
var $retryAfterMs = z3.number().int().positive().max(6e4);
var $positiveAmount = z3.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a decimal string").refine((amount) => Number(amount) > 0, "must be positive");
var $checkout2 = obj3({
  amount: obj3({ currency: z3.literal("USD"), amount: $positiveAmount }),
  destination: obj3({ asset: $nonEmpty2, network: $nonEmpty2 }),
  paymentMethod: z3.literal("apple_pay")
});
var CoinbaseCheckoutSchema = $checkout2;
var contextFields = { checkout: $checkout2, destinationAsset: DestinationAssetSchema.optional() };
var $requestContext2 = obj3(contextFields);
var CoinbaseRequestContextSchema = $requestContext2;
var observeFields = { action: z3.literal("observe") };
var consentFields = {
  action: z3.literal("consent"),
  acceptances: z3.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds3(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once")
};
var sessionPhoneFields = { action: z3.literal("session"), phoneNumber: z3.string().regex(/^\+[1-9]\d{1,14}$/) };
var sessionResendFields = { action: z3.literal("session"), resend: $nonEmpty2 };
var otpFields = { action: z3.literal("otp"), verificationRef: $nonEmpty2, otpCode: z3.string().regex(/^\d{6}$/) };
var $kycValues = z3.record(KycFieldIdSchema, z3.string());
var kycFields = { action: z3.literal("kyc"), values: $kycValues };
var $mintedOrderId = z3.string().regex(/^cbo_[A-Za-z0-9_-]{22}$/, "must be an order id a placeOrder answer minted");
var placeOrderFields = { action: z3.literal("placeOrder"), orderId: $mintedOrderId };
var orderFields = { action: z3.literal("order"), orderId: $mintedOrderId };
var $observeRequest2 = obj3({ ...contextFields, ...observeFields });
var $consentRequest2 = obj3({ ...contextFields, ...consentFields });
var $sessionRequest2 = z3.union([obj3({ ...contextFields, ...sessionPhoneFields }), obj3({ ...contextFields, ...sessionResendFields })]);
var $otpRequest = obj3({ ...contextFields, ...otpFields });
var $kycRequest2 = obj3({ ...contextFields, ...kycFields });
var $placeOrderRequest = obj3({ ...contextFields, ...placeOrderFields });
var $orderRequest2 = obj3({ ...contextFields, ...orderFields });
var CoinbaseObserveRequestSchema = $observeRequest2;
var CoinbaseConsentRequestSchema = $consentRequest2;
var CoinbaseSessionRequestSchema = $sessionRequest2;
var CoinbaseOtpRequestSchema = $otpRequest;
var CoinbaseKycRequestSchema = $kycRequest2;
var CoinbasePlaceOrderRequestSchema = $placeOrderRequest;
var CoinbaseOrderRequestSchema = $orderRequest2;
var $request2 = z3.union([$observeRequest2, $consentRequest2, $sessionRequest2, $otpRequest, $kycRequest2, $placeOrderRequest, $orderRequest2]);
var CoinbaseRequestSchema = $request2;
var envelope = { provider: z3.literal("COINBASE"), geo: FiatGeoSchema, depositAddress: $nonEmpty2.optional(), ...contextFields };
var $nextRequest3 = z3.union([
  obj3({ ...envelope, ...observeFields }),
  obj3({ ...envelope, ...consentFields }),
  obj3({ ...envelope, ...sessionPhoneFields }),
  obj3({ ...envelope, ...sessionResendFields }),
  obj3({ ...envelope, ...otpFields }),
  obj3({ ...envelope, ...kycFields }),
  obj3({ ...envelope, ...placeOrderFields }),
  obj3({ ...envelope, ...orderFields })
]);
var CoinbaseNextRequestSchema = $nextRequest3;
var $price = obj3({
  total: FiatAmountSchema,
  fees: z3.array(FeeLineSchema),
  cryptoAmount: $nonEmpty2,
  feeSubsidy: FiatAmountSchema.optional()
});
var CoinbasePriceSchema = $price;
var $reask2 = obj3({
  requirements: z3.array(KycFieldIdSchema).min(1).refine(hasUniqueIds3, "requirements must be unique"),
  reason: z3.enum(["REJECTED"]).nullable()
});
var CoinbaseReaskSchema = $reask2;
var $consentShape2 = obj3({ next: z3.literal("consent"), documents: z3.array(TermsDocumentSchema).min(1) });
var $sessionNextAction2 = obj3({ next: z3.literal("session"), error: z3.literal("CODE_EXPIRED").nullable() });
var $otpNextAction = obj3({
  next: z3.literal("otp"),
  verificationRef: $nonEmpty2,
  expiresAt: z3.string().datetime({ offset: true }),
  error: z3.literal("CODE_INVALID").nullable()
});
var $kycShape2 = obj3({
  next: z3.literal("kyc"),
  fields: z3.array(FormFieldSchema),
  fieldErrors: z3.array(obj3({ fieldId: $nonEmpty2, message: $nonEmpty2 })).min(1).optional(),
  reask: $reask2.nullable()
});
var $waitNextAction2 = obj3({ next: z3.literal("wait"), retryAfterMs: $retryAfterMs });
var $placeOrderNextAction = obj3({ next: z3.literal("placeOrder"), price: $price, orderId: $nonEmpty2 });
var $payNextAction2 = obj3({
  next: z3.literal("pay"),
  orderId: $nonEmpty2,
  price: $price,
  // As the shared links are checked: `z.string().url()` would also take `http:` and `javascript:`.
  paymentLink: obj3({ url: z3.string().regex(/^https:\/\/\S+$/, "must be an https URL") }),
  environment: z3.enum(["sandbox", "production"])
});
var $orderPendingNextAction2 = obj3({
  next: z3.literal("orderPending"),
  orderId: $nonEmpty2,
  retryAfterMs: $retryAfterMs,
  order: FiatStepResponseSchema.nullable()
});
var checkConsent2 = (nextAction, context2) => {
  if (!hasUniqueIds3(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc2 = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds3(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
};
var CoinbaseConsentNextActionSchema = $consentShape2.superRefine(checkConsent2);
var CoinbaseSessionNextActionSchema = $sessionNextAction2;
var CoinbaseOtpNextActionSchema = $otpNextAction;
var CoinbaseKycNextActionSchema = $kycShape2.superRefine(checkKyc2);
var CoinbaseWaitNextActionSchema = $waitNextAction2;
var CoinbasePlaceOrderNextActionSchema = $placeOrderNextAction;
var CoinbasePayNextActionSchema = $payNextAction2;
var CoinbaseOrderPendingNextActionSchema = $orderPendingNextAction2;
var checkNextAction2 = (response, context2) => {
  if (response.next === "consent") checkConsent2(response, context2);
  if (response.next === "kyc") checkKyc2(response, context2);
};
var $nextActionOptions2 = [
  $consentShape2,
  $sessionNextAction2,
  $otpNextAction,
  $kycShape2,
  $waitNextAction2,
  $placeOrderNextAction,
  $payNextAction2,
  $orderPendingNextAction2
];
var $nextAction2 = z3.discriminatedUnion("next", [...$nextActionOptions2]).superRefine(checkNextAction2);
var CoinbaseNextActionSchema = $nextAction2;
var $done2 = obj3({ next: z3.literal("done"), order: FiatStepResponseSchema });
var CoinbaseDoneSchema = $done2;
var $refused = z3.union([
  obj3({
    next: z3.literal("refused"),
    reason: z3.enum(["NOT_ELIGIBLE", "KYC_UPGRADE_REJECTED", "FINAL_REJECTION", "TOTAL_MISMATCH"]),
    recovery: z3.enum(["REQUOTE", "NONE"])
  }),
  obj3({
    next: z3.literal("refused"),
    reason: z3.literal("LIMITS_EXCEEDED"),
    recovery: z3.literal("REQUOTE"),
    maxAmount: FiatAmountSchema.nullable()
  })
]);
var CoinbaseRefusedSchema = $refused;
var $stepResponse3 = z3.union([z3.discriminatedUnion("next", [...$nextActionOptions2, $done2]), $refused]).superRefine(checkNextAction2);
var CoinbaseStepResponseSchema = $stepResponse3;
var $orderResponse2 = z3.discriminatedUnion("next", [$done2, $orderPendingNextAction2]);
var CoinbaseOrderResponseSchema = $orderResponse2;
var CoinbaseResponseSchemaFor = {
  observe: CoinbaseStepResponseSchema,
  consent: CoinbaseStepResponseSchema,
  session: CoinbaseStepResponseSchema,
  otp: CoinbaseStepResponseSchema,
  kyc: CoinbaseStepResponseSchema,
  placeOrder: CoinbaseStepResponseSchema,
  order: CoinbaseOrderResponseSchema
};
var faultFields = {
  reason: z3.enum(["SESSION_BUDGET_SPENT", "RATE_LIMITED", "PROVIDER_UNAVAILABLE", "KYC_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INVALID_REQUEST"]),
  recovery: z3.enum(["RETRY", "REQUOTE", "NONE"])
};
var $fault2 = obj3(faultFields);
var CoinbaseFaultSchema = $fault2;
var $errorBody2 = obj3({
  ...faultFields,
  errorCode: $nonEmpty2,
  errorMsg: z3.string(),
  reqId: z3.string().optional(),
  retryAfterSeconds: z3.number().int().positive().optional()
});
var CoinbaseErrorBodySchema = $errorBody2;

// src/providers/stripe.schemas.ts
import { z as z4 } from "zod";
var obj4 = (shape) => z4.object(shape).strict();
var nonEmpty = z4.string().refine((value) => value.trim().length > 0, "must not be blank");
var hasUniqueIds4 = (ids) => new Set(ids).size === ids.length;
var retryAfterMs = z4.number().int().positive().max(6e4);
var usdAmount = z4.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, "must be a USD amount in cents").refine((amount) => Number(amount) > 0, "must be positive");
var kycValues = z4.record(KycFieldIdSchema, z4.string());
var instant = z4.string().datetime({ offset: true });
var checkout = obj4({
  amount: obj4({ currency: z4.literal("USD"), amount: usdAmount }),
  destination: obj4({ asset: nonEmpty, network: nonEmpty }),
  paymentMethod: z4.literal("apple_pay")
});
var StripeCheckoutSchema = checkout;
var contextFields2 = { checkout };
var requestContext = obj4(contextFields2);
var StripeRequestContextSchema = requestContext;
var mintedOrderId = z4.string().regex(/^sto_[A-Za-z0-9_-]{22}$/, "must be an order id a placeOrder answer minted");
var heldOrder = { orderId: mintedOrderId.optional() };
var observeFields2 = { action: z4.literal("observe"), ...heldOrder };
var consentFields2 = {
  action: z4.literal("consent"),
  acceptances: z4.array(TermsDocumentAcceptanceSchema).min(1).refine((acceptances) => hasUniqueIds4(acceptances.map((acceptance) => acceptance.documentId)), "each document is accepted once"),
  ...heldOrder
};
var sessionFields = { action: z4.literal("session"), ...heldOrder };
var authorizeConsentedFields = {
  action: z4.literal("authorize"),
  linkAuthIntentId: nonEmpty,
  outcome: z4.literal("Consented"),
  customerId: nonEmpty,
  ...heldOrder
};
var authorizeDeclinedFields = { action: z4.literal("authorize"), linkAuthIntentId: nonEmpty, outcome: z4.enum(["Denied", "Cancelled"]), ...heldOrder };
var correctionRound = z4.number().int().nonnegative();
var kycFields2 = { action: z4.literal("kyc"), correctionRound, values: kycValues, ...heldOrder };
var placeOrderFields2 = { action: z4.literal("placeOrder"), orderId: mintedOrderId, cryptoPaymentToken: nonEmpty };
var checkoutFields = { action: z4.literal("checkout"), orderId: mintedOrderId, callbackId: z4.string().regex(/^[A-Za-z0-9_-]{1,200}$/) };
var orderFields2 = { action: z4.literal("order"), orderId: mintedOrderId };
var observeRequest = obj4({ ...contextFields2, ...observeFields2 });
var consentRequest = obj4({ ...contextFields2, ...consentFields2 });
var sessionRequest = obj4({ ...contextFields2, ...sessionFields });
var authorizeRequest = z4.union([obj4({ ...contextFields2, ...authorizeConsentedFields }), obj4({ ...contextFields2, ...authorizeDeclinedFields })]);
var kycRequest = obj4({ ...contextFields2, ...kycFields2 });
var placeOrderRequest = obj4({ ...contextFields2, ...placeOrderFields2 });
var checkoutRequest = obj4({ ...contextFields2, ...checkoutFields });
var orderRequest = obj4({ ...contextFields2, ...orderFields2 });
var StripeObserveRequestSchema = observeRequest;
var StripeConsentRequestSchema = consentRequest;
var StripeSessionRequestSchema = sessionRequest;
var StripeAuthorizeRequestSchema = authorizeRequest;
var StripeKycRequestSchema = kycRequest;
var StripePlaceOrderRequestSchema = placeOrderRequest;
var StripeCheckoutRequestSchema = checkoutRequest;
var StripeOrderRequestSchema = orderRequest;
var request = z4.union([observeRequest, consentRequest, sessionRequest, authorizeRequest, kycRequest, placeOrderRequest, checkoutRequest, orderRequest]);
var StripeRequestSchema = request;
var envelope2 = { provider: z4.literal("STRIPE"), geo: FiatGeoSchema, ...contextFields2 };
var nextRequest = z4.union([
  obj4({ ...envelope2, ...observeFields2 }),
  obj4({ ...envelope2, ...consentFields2 }),
  obj4({ ...envelope2, ...sessionFields }),
  obj4({ ...envelope2, ...authorizeConsentedFields }),
  obj4({ ...envelope2, ...authorizeDeclinedFields }),
  obj4({ ...envelope2, ...kycFields2 }),
  obj4({ ...envelope2, ...placeOrderFields2 }),
  obj4({ ...envelope2, ...checkoutFields }),
  obj4({ ...envelope2, ...orderFields2 })
]);
var StripeNextRequestSchema = nextRequest;
var price = obj4({ total: FiatAmountSchema, fees: z4.array(FeeLineSchema), cryptoAmount: nonEmpty });
var StripePriceSchema = price;
var paySheet = obj4({
  destinationCurrency: nonEmpty,
  destinationNetwork: nonEmpty,
  walletAddress: nonEmpty,
  merchantCountryCode: z4.literal("US"),
  currencyCode: z4.literal("USD"),
  amount: usdAmount,
  label: nonEmpty
});
var StripePaySheetSchema = paySheet;
var linkAuthToken = obj4({ clientSecret: nonEmpty, expiresAt: instant });
var StripeLinkAuthTokenSchema = linkAuthToken;
var reask = obj4({
  requirements: z4.array(KycFieldIdSchema).min(1).refine(hasUniqueIds4, "requirements must be unique"),
  reason: z4.enum(["REJECTED"]).nullable()
});
var StripeReaskSchema = reask;
var consentShape = obj4({ next: z4.literal("consent"), documents: z4.array(TermsDocumentSchema).min(1) });
var sessionNextAction = obj4({ next: z4.literal("session") });
var authorizeNextAction = obj4({ next: z4.literal("authorize"), linkAuthIntentId: nonEmpty, expiresAt: instant });
var kycShape = obj4({
  next: z4.literal("kyc"),
  round: z4.enum(["ACCOUNT", "IDENTITY"]),
  tier: z4.enum(["l0", "l1"]),
  correctionRound,
  fields: z4.array(FormFieldSchema),
  heldValues: kycValues,
  verifiedEmail: nonEmpty.nullable(),
  linkAuthToken: linkAuthToken.nullable(),
  fieldErrors: z4.array(obj4({ fieldId: nonEmpty, message: nonEmpty })).min(1).optional(),
  reask: reask.nullable()
});
var verifyIdentityNextAction = obj4({ next: z4.literal("verifyIdentity"), linkAuthToken: linkAuthToken.nullable() });
var waitNextAction = obj4({ next: z4.literal("wait"), retryAfterMs });
var placeOrderNextAction = obj4({
  next: z4.literal("placeOrder"),
  orderId: mintedOrderId,
  price,
  paySheet,
  linkAuthToken: linkAuthToken.nullable()
});
var payNextAction = obj4({ next: z4.literal("pay"), orderId: mintedOrderId, sessionId: nonEmpty, linkAuthToken: linkAuthToken.nullable() });
var checkoutSecretNextAction = obj4({ next: z4.literal("checkoutSecret"), clientSecret: nonEmpty });
var orderPendingNextAction = obj4({
  next: z4.literal("orderPending"),
  orderId: mintedOrderId,
  retryAfterMs,
  order: FiatStepResponseSchema.nullable()
});
var checkConsent3 = (nextAction, context2) => {
  if (!hasUniqueIds4(nextAction.documents.map((document) => document.id))) {
    context2.addIssue({ code: "custom", path: ["documents"], message: "document ids must be unique" });
  }
};
var checkKyc3 = (nextAction, context2) => {
  const fieldIds = nextAction.fields.map((field) => field.id);
  if (!hasUniqueIds4(fieldIds)) {
    context2.addIssue({ code: "custom", path: ["fields"], message: "field ids must be unique" });
  }
  if (nextAction.fieldErrors?.some((error) => !fieldIds.includes(error.fieldId))) {
    context2.addIssue({ code: "custom", path: ["fieldErrors"], message: "a field error must name a field in this next action" });
  }
  if (nextAction.reask?.requirements.some((requirement) => !fieldIds.includes(requirement))) {
    context2.addIssue({ code: "custom", path: ["reask"], message: "a kyc reask must name fields in this next action" });
  }
  if (nextAction.round === "ACCOUNT" !== (nextAction.verifiedEmail !== null)) {
    context2.addIssue({ code: "custom", path: ["verifiedEmail"], message: "only the account round carries the verified email" });
  }
};
var checkPlaceOrder = (nextAction, context2) => {
  if (nextAction.paySheet.amount !== nextAction.price.total.amount) {
    context2.addIssue({ code: "custom", path: ["paySheet", "amount"], message: "the sheet charges the price shown" });
  }
};
var StripeConsentNextActionSchema = consentShape.superRefine(checkConsent3);
var StripeSessionNextActionSchema = sessionNextAction;
var StripeAuthorizeNextActionSchema = authorizeNextAction;
var StripeKycNextActionSchema = kycShape.superRefine(checkKyc3);
var StripeVerifyIdentityNextActionSchema = verifyIdentityNextAction;
var StripeWaitNextActionSchema = waitNextAction;
var StripePlaceOrderNextActionSchema = placeOrderNextAction.superRefine(checkPlaceOrder);
var StripePayNextActionSchema = payNextAction;
var StripeCheckoutSecretNextActionSchema = checkoutSecretNextAction;
var StripeOrderPendingNextActionSchema = orderPendingNextAction;
var checkNextAction3 = (response, context2) => {
  if (response.next === "consent") checkConsent3(response, context2);
  if (response.next === "kyc") checkKyc3(response, context2);
  if (response.next === "placeOrder") checkPlaceOrder(response, context2);
};
var nextActionOptions = [
  consentShape,
  sessionNextAction,
  authorizeNextAction,
  kycShape,
  verifyIdentityNextAction,
  waitNextAction,
  placeOrderNextAction,
  payNextAction,
  orderPendingNextAction
];
var anyNextAction = z4.discriminatedUnion("next", [...nextActionOptions]).superRefine(checkNextAction3);
var StripeNextActionSchema = anyNextAction;
var done = obj4({ next: z4.literal("done"), order: FiatStepResponseSchema });
var StripeDoneSchema = done;
var refused = z4.union([
  obj4({
    next: z4.literal("refused"),
    reason: z4.enum(["NOT_ELIGIBLE", "KYC_REJECTED", "FINAL_REJECTION", "TOTAL_MISMATCH"]),
    recovery: z4.enum(["REQUOTE", "NONE"])
  }),
  obj4({
    next: z4.literal("refused"),
    reason: z4.literal("LIMITS_EXCEEDED"),
    recovery: z4.literal("REQUOTE"),
    maxAmount: FiatAmountSchema.nullable()
  })
]);
var StripeRefusedSchema = refused;
var stepResponse = z4.union([z4.discriminatedUnion("next", [...nextActionOptions, done]), refused]).superRefine(checkNextAction3);
var StripeStepResponseSchema = stepResponse;
var checkoutResponse = z4.union([z4.discriminatedUnion("next", [...nextActionOptions, done, checkoutSecretNextAction]), refused]).superRefine(checkNextAction3);
var StripeCheckoutResponseSchema = checkoutResponse;
var orderResponse = z4.discriminatedUnion("next", [done, orderPendingNextAction]);
var StripeOrderResponseSchema = orderResponse;
var StripeResponseSchemaFor = {
  observe: StripeStepResponseSchema,
  consent: StripeStepResponseSchema,
  session: StripeStepResponseSchema,
  authorize: StripeStepResponseSchema,
  kyc: StripeStepResponseSchema,
  placeOrder: StripeStepResponseSchema,
  checkout: StripeCheckoutResponseSchema,
  order: StripeOrderResponseSchema
};
var faultFields2 = {
  reason: z4.enum(["SESSION_BUDGET_SPENT", "RATE_LIMITED", "PROVIDER_UNAVAILABLE", "KYC_PROVIDER_UNAVAILABLE", "SERVICE_UNAVAILABLE", "INVALID_REQUEST"]),
  recovery: z4.enum(["RETRY", "REQUOTE", "NONE"])
};
var fault = obj4(faultFields2);
var StripeFaultSchema = fault;
var errorBody = obj4({
  ...faultFields2,
  errorCode: nonEmpty,
  errorMsg: z4.string(),
  reqId: z4.string().optional(),
  retryAfterSeconds: z4.number().int().nonnegative().optional()
});
var StripeErrorBodySchema = errorBody;

// src/providers/moonpay-guest.schemas.ts
import { z as z5 } from "zod";
var context = { checkout: MoonPayCheckoutSchema, destinationAsset: DestinationAssetSchema.optional() };
var obj5 = (shape) => z5.object(shape).strict();
var nonEmpty2 = z5.string().refine((value) => value.trim().length > 0, "must not be blank");
var actions = [
  { action: z5.literal("observe") },
  { action: z5.literal("session") },
  { action: z5.literal("consent"), acceptances: z5.array(TermsDocumentAcceptanceSchema).min(1).refine((values) => new Set(values.map((v) => v.documentId)).size === values.length, "each document is accepted once") },
  { action: z5.literal("order"), orderId: nonEmpty2, quotedAmount: FiatAmountSchema, transactionId: nonEmpty2.optional() },
  { action: z5.literal("phone"), phoneNumber: z5.string().regex(/^\+[1-9]\d{1,14}$/) },
  { action: z5.literal("phone"), resend: nonEmpty2 },
  { action: z5.literal("phoneCode"), verificationRef: nonEmpty2, otpCode: z5.string().regex(/^\d{6}$/) },
  { action: z5.literal("decline"), reason: MoonPayGuestDeclineReasonSchema }
];
var MoonPayGuestObserveRequestSchema = obj5({ ...context, ...actions[0] });
var MoonPayGuestSessionRequestSchema = obj5({ ...context, ...actions[1] });
var MoonPayGuestConsentRequestSchema = obj5({ ...context, ...actions[2] });
var MoonPayGuestOrderRequestSchema = obj5({ ...context, ...actions[3] });
var MoonPayGuestPhoneNumberRequestSchema = obj5({ ...context, ...actions[4] });
var MoonPayGuestPhoneResendRequestSchema = obj5({ ...context, ...actions[5] });
var MoonPayGuestPhoneCodeRequestSchema = obj5({ ...context, ...actions[6] });
var MoonPayGuestDeclineRequestSchema = obj5({ ...context, ...actions[7] });
var MoonPayGuestPhoneRequestSchema = z5.union([MoonPayGuestPhoneNumberRequestSchema, MoonPayGuestPhoneResendRequestSchema]);
var MoonPayGuestRequestSchema = z5.union([
  MoonPayGuestObserveRequestSchema,
  MoonPayGuestSessionRequestSchema,
  MoonPayGuestConsentRequestSchema,
  MoonPayGuestOrderRequestSchema,
  MoonPayGuestPhoneNumberRequestSchema,
  MoonPayGuestPhoneResendRequestSchema,
  MoonPayGuestPhoneCodeRequestSchema,
  MoonPayGuestDeclineRequestSchema
]);
var MoonPayGuestNextRequestSchema = z5.union([
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[0] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[1] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[2] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[3] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[4] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[5] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[6] }),
  obj5({ provider: z5.literal("MOONPAY_GUEST"), geo: FiatGeoSchema, depositAddress: nonEmpty2.optional(), ...context, ...actions[7] })
]);
var MoonPayGuestStepResponseSchema = z5.union([
  MoonPayConsentNextActionSchema,
  MoonPaySessionNextActionSchema,
  MoonPayPhoneNextActionSchema,
  MoonPayPhoneCodeNextActionSchema,
  MoonPayPayNextActionSchema,
  obj5({ next: z5.literal("refused"), reason: z5.enum(["NOT_ELIGIBLE", "FINAL_REJECTION"]), recovery: z5.enum(["REQUOTE", "NONE"]) })
]);
var MoonPayGuestResponseSchema = z5.union([MoonPayGuestStepResponseSchema, MoonPayOrderResponseSchema]);
export {
  BlockedReasonSchema,
  BlockedStateSchema,
  COINBASE_ENDPOINTS,
  COINBASE_TERMS,
  COUNTRY_NAMES,
  COUNTRY_TO_CURRENCY,
  ClientExecutedDeliverySchema,
  CoinbaseCheckoutSchema,
  CoinbaseConsentNextActionSchema,
  CoinbaseConsentRequestSchema,
  CoinbaseDoneSchema,
  CoinbaseErrorBodySchema,
  CoinbaseFaultSchema,
  CoinbaseKycNextActionSchema,
  CoinbaseKycRequestSchema,
  CoinbaseNextActionSchema,
  CoinbaseNextRequestSchema,
  CoinbaseObserveRequestSchema,
  CoinbaseOrderPendingNextActionSchema,
  CoinbaseOrderRequestSchema,
  CoinbaseOrderResponseSchema,
  CoinbaseOtpNextActionSchema,
  CoinbaseOtpRequestSchema,
  CoinbasePayNextActionSchema,
  CoinbasePlaceOrderNextActionSchema,
  CoinbasePlaceOrderRequestSchema,
  CoinbasePriceSchema,
  CoinbaseReaskSchema,
  CoinbaseRefusedSchema,
  CoinbaseRequestContextSchema,
  CoinbaseRequestSchema,
  CoinbaseResponseSchemaFor,
  CoinbaseSessionNextActionSchema,
  CoinbaseSessionRequestSchema,
  CoinbaseStepResponseSchema,
  CoinbaseWaitNextActionSchema,
  ContractViolation,
  CountryCode,
  CryptoAmountSchema,
  DOCUMENTED_ENDPOINTS,
  DeliveryStateSchema,
  DestinationAssetSchema,
  ENDPOINT_PATTERN,
  FIAT_CURRENCY_NAMES,
  FIAT_TERMS_ENDPOINT,
  FIELD_SPEC_TYPES,
  FIXTURES,
  FIXTURE_COVERAGE_GAPS,
  FUN_AUTH_ERROR_CODES,
  FUN_KYC_CONSENT_DOCUMENTS,
  FailureReasonSchema,
  FeeLineSchema,
  FiatAmountSchema,
  FiatAuthRefreshRequestSchema,
  FiatAuthRefreshResponseSchema,
  FiatAuthRevokeRequestSchema,
  FiatAuthStartRequestSchema,
  FiatAuthVerifyRequestSchema,
  FiatCurrencyCode,
  FiatEndpointSchema,
  FiatGeoSchema,
  FiatNextRequestSchema,
  FiatProviderSchema,
  FiatRoutingQuoteErrorBodySchema,
  FiatRoutingQuoteRequestSchema,
  FiatRoutingQuoteTermsSchema,
  FiatRoutingTableErrorBodySchema,
  FiatRoutingTableRequestSchema,
  FiatRoutingTableResponseSchema,
  FiatSessionSchema,
  FiatStepResponseSchema,
  FiatTermsErrorBodySchema,
  FiatTermsRequestSchema,
  FiatTermsResponseSchema,
  FieldSpecSchema,
  FlowStateSchema,
  FormDescriptorSchema,
  FormFieldSchema,
  FormFieldTypeSchema,
  FunAuthStateSchema,
  HTTP_VERBS,
  InstructionFieldSchema,
  InstructionsSchema,
  InstrumentSchema,
  JsonSchema,
  KYCProviderSchema,
  KYC_ACKNOWLEDGEMENT_FIELD_IDS,
  KycCaptureStateSchema,
  KycFieldIdSchema,
  KycInputRequiredStateSchema,
  KycNoActionRequiredStateSchema,
  KycReviewDurationSchema,
  KycSdkResultReportSchema,
  MOONPAY_ENDPOINTS,
  MoonPayCaptureDocumentSchema,
  MoonPayCaptureNextActionSchema,
  MoonPayCaptureRequestSchema,
  MoonPayCheckoutSchema,
  MoonPayConnectNextActionSchema,
  MoonPayConnectRequestSchema,
  MoonPayConsentNextActionSchema,
  MoonPayConsentRequestSchema,
  MoonPayDeclineRequestSchema,
  MoonPayDoneSchema,
  MoonPayErrorBodySchema,
  MoonPayFaultSchema,
  MoonPayGuestConsentRequestSchema,
  MoonPayGuestDeclineReasonSchema,
  MoonPayGuestDeclineRequestSchema,
  MoonPayGuestNextRequestSchema,
  MoonPayGuestObserveRequestSchema,
  MoonPayGuestOrderRequestSchema,
  MoonPayGuestPhoneCodeRequestSchema,
  MoonPayGuestPhoneNumberRequestSchema,
  MoonPayGuestPhoneRequestSchema,
  MoonPayGuestPhoneResendRequestSchema,
  MoonPayGuestRequestSchema,
  MoonPayGuestResponseSchema,
  MoonPayGuestSessionRequestSchema,
  MoonPayGuestStepResponseSchema,
  MoonPayKycNextActionSchema,
  MoonPayKycRequestSchema,
  MoonPayNextActionSchema,
  MoonPayNextRequestSchema,
  MoonPayObserveRequestSchema,
  MoonPayOrderNextActionSchema,
  MoonPayOrderPendingNextActionSchema,
  MoonPayOrderRequestSchema,
  MoonPayOrderResponseSchema,
  MoonPayPayNextActionSchema,
  MoonPayPhoneCodeNextActionSchema,
  MoonPayPhoneCodeRequestSchema,
  MoonPayPhoneNextActionSchema,
  MoonPayPhoneRequestSchema,
  MoonPayPrepareCaptureNextActionSchema,
  MoonPayPrepareCaptureRequestSchema,
  MoonPayQuoteInputSchema,
  MoonPayReaskReasonSchema,
  MoonPayReaskRequirementSchema,
  MoonPayReaskSchema,
  MoonPayRequestContextSchema,
  MoonPayRequestSchema,
  MoonPayResponseSchemaFor,
  MoonPaySdkCredentialsSchema,
  MoonPaySessionNextActionSchema,
  MoonPaySessionRequestSchema,
  MoonPayStepResponseSchema,
  MoonPayWaitNextActionSchema,
  OrderAwaitingConfirmationStateSchema,
  OrderCreatedStateSchema,
  OrderRefSchema,
  OrderStatusSchema,
  OrderSummarySchema,
  PAYMENT_METHOD_CATEGORIES,
  PROVIDER_CHECKOUT_DOCUMENTS,
  PROVIDER_KYC_DOCUMENTS,
  PUBLISHED_TERMS_DOCUMENTS,
  PaymentCaptureStateSchema,
  PaymentInstructStateSchema,
  PaymentSurfaceSchema,
  PendingOrderStateSchema,
  PollSpecSchema,
  PreferredIdentityDocumentSchema,
  PreparedPaymentSchema,
  QuoteLimitRangeSchema,
  QuoteLimitsSchema,
  QuoteSchema,
  QuoteStateSchema,
  ROUTING_ENDPOINTS,
  RecoverySchema,
  RefundSchema,
  ReportSpecSchema,
  STANDARD_KYC_FIELD_IDS,
  STATE_KEYS,
  STRIPE_ENDPOINTS,
  SelectOptionSchema,
  SessionAuthStateSchema,
  StatusHistoryEntrySchema,
  StripeAuthorizeNextActionSchema,
  StripeAuthorizeRequestSchema,
  StripeCheckoutRequestSchema,
  StripeCheckoutResponseSchema,
  StripeCheckoutSchema,
  StripeCheckoutSecretNextActionSchema,
  StripeConsentNextActionSchema,
  StripeConsentRequestSchema,
  StripeDoneSchema,
  StripeErrorBodySchema,
  StripeFaultSchema,
  StripeKycNextActionSchema,
  StripeKycRequestSchema,
  StripeLinkAuthTokenSchema,
  StripeNextActionSchema,
  StripeNextRequestSchema,
  StripeObserveRequestSchema,
  StripeOrderPendingNextActionSchema,
  StripeOrderRequestSchema,
  StripeOrderResponseSchema,
  StripePayNextActionSchema,
  StripePaySheetSchema,
  StripePlaceOrderNextActionSchema,
  StripePlaceOrderRequestSchema,
  StripePriceSchema,
  StripeReaskSchema,
  StripeRefusedSchema,
  StripeRequestContextSchema,
  StripeRequestSchema,
  StripeResponseSchemaFor,
  StripeSessionNextActionSchema,
  StripeSessionRequestSchema,
  StripeStepResponseSchema,
  StripeVerifyIdentityNextActionSchema,
  StripeWaitNextActionSchema,
  SurfaceKindSchema,
  SurfaceProviderSchema,
  SurfaceSchema,
  TABLE_VERSION,
  TERMINAL_ORDER_STATUSES,
  TRANSITION_TABLE,
  TermsAcceptanceSchema,
  TermsDocumentAcceptanceSchema,
  TermsDocumentSchema,
  TransitionInputsSchema,
  TransitionParamsSchema,
  TransitionSchema,
  TxSchema,
  UNOFFERED_ENDPOINTS,
  UNREACHABLE_STATES,
  US_STATE_CODES,
  UsStateCodeSchema,
  assertAllFixtures,
  assertFiatStepResponse,
  assertFixture,
  assertLegalEmission,
  assertLegalReturn,
  checkLegalEmission,
  endpointMatches,
  fixtureMeta,
  isTerminal,
  loadFixture,
  loadFixtures,
  looksLikeFieldSpec,
  stateKey,
  tableEntry,
  unofferedEndpoints,
  unreachableStates,
  walkTable
};
