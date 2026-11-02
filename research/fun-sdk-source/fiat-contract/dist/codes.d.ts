/**
 * Closed code vocabularies. `country`/`fiatCurrency` mirror ISO 3166-1 alpha-2 / ISO 4217
 * (circulating fiat only, no precious-metal/SDR codes); `paymentMethod` is fun-backend/provider
 * vocabulary, not a standard. `COUNTRY_CURRENCY_LIST` is the source of truth; everything below derives from it.
 */
/** ISO 3166-2:US subdivision codes for the 50 states, DC, and five inhabited territories. */
export declare const US_STATE_CODES: readonly ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AS", "GU", "MP", "PR", "VI"];
export type UsStateCode = (typeof US_STATE_CODES)[number];
declare const COUNTRY_CURRENCY_LIST: readonly [{
    readonly country: "AD";
    readonly countryName: "Andorra";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "AE";
    readonly countryName: "United Arab Emirates";
    readonly currency: "AED";
    readonly currencyName: "UAE Dirham";
}, {
    readonly country: "AF";
    readonly countryName: "Afghanistan";
    readonly currency: "AFN";
    readonly currencyName: "Afghan Afghani";
}, {
    readonly country: "AG";
    readonly countryName: "Antigua and Barbuda";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "AI";
    readonly countryName: "Anguilla";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "AL";
    readonly countryName: "Albania";
    readonly currency: "ALL";
    readonly currencyName: "Albanian Lek";
}, {
    readonly country: "AM";
    readonly countryName: "Armenia";
    readonly currency: "AMD";
    readonly currencyName: "Armenian Dram";
}, {
    readonly country: "AO";
    readonly countryName: "Angola";
    readonly currency: "AOA";
    readonly currencyName: "Angolan Kwanza";
}, {
    readonly country: "AQ";
    readonly countryName: "Antarctica";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "AR";
    readonly countryName: "Argentina";
    readonly currency: "ARS";
    readonly currencyName: "Argentine Peso";
}, {
    readonly country: "AS";
    readonly countryName: "American Samoa";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "AT";
    readonly countryName: "Austria";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "AU";
    readonly countryName: "Australia";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "AW";
    readonly countryName: "Aruba";
    readonly currency: "AWG";
    readonly currencyName: "Aruban Florin";
}, {
    readonly country: "AX";
    readonly countryName: "Åland Islands";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "AZ";
    readonly countryName: "Azerbaijan";
    readonly currency: "AZN";
    readonly currencyName: "Azerbaijani Manat";
}, {
    readonly country: "BA";
    readonly countryName: "Bosnia and Herzegovina";
    readonly currency: "BAM";
    readonly currencyName: "Bosnia-Herzegovina Convertible Mark";
}, {
    readonly country: "BB";
    readonly countryName: "Barbados";
    readonly currency: "BBD";
    readonly currencyName: "Barbadian Dollar";
}, {
    readonly country: "BD";
    readonly countryName: "Bangladesh";
    readonly currency: "BDT";
    readonly currencyName: "Bangladeshi Taka";
}, {
    readonly country: "BE";
    readonly countryName: "Belgium";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "BF";
    readonly countryName: "Burkina Faso";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "BG";
    readonly countryName: "Bulgaria";
    readonly currency: "BGN";
    readonly currencyName: "Bulgarian Lev";
}, {
    readonly country: "BH";
    readonly countryName: "Bahrain";
    readonly currency: "BHD";
    readonly currencyName: "Bahraini Dinar";
}, {
    readonly country: "BI";
    readonly countryName: "Burundi";
    readonly currency: "BIF";
    readonly currencyName: "Burundian Franc";
}, {
    readonly country: "BJ";
    readonly countryName: "Benin";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "BL";
    readonly countryName: "Saint Barthélemy";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "BM";
    readonly countryName: "Bermuda";
    readonly currency: "BMD";
    readonly currencyName: "Bermudan Dollar";
}, {
    readonly country: "BN";
    readonly countryName: "Brunei";
    readonly currency: "BND";
    readonly currencyName: "Brunei Dollar";
}, {
    readonly country: "BO";
    readonly countryName: "Bolivia";
    readonly currency: "BOB";
    readonly currencyName: "Bolivian Boliviano";
}, {
    readonly country: "BQ";
    readonly countryName: "Bonaire, Sint Eustatius and Saba";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "BR";
    readonly countryName: "Brazil";
    readonly currency: "BRL";
    readonly currencyName: "Brazilian Real";
}, {
    readonly country: "BS";
    readonly countryName: "Bahamas";
    readonly currency: "BSD";
    readonly currencyName: "Bahamian Dollar";
}, {
    readonly country: "BT";
    readonly countryName: "Bhutan";
    readonly currency: "BTN";
    readonly currencyName: "Bhutanese Ngultrum";
}, {
    readonly country: "BV";
    readonly countryName: "Bouvet Island";
    readonly currency: "NOK";
    readonly currencyName: "Norwegian Krone";
}, {
    readonly country: "BW";
    readonly countryName: "Botswana";
    readonly currency: "BWP";
    readonly currencyName: "Botswanan Pula";
}, {
    readonly country: "BY";
    readonly countryName: "Belarus";
    readonly currency: "BYN";
    readonly currencyName: "Belarusian Ruble";
}, {
    readonly country: "BZ";
    readonly countryName: "Belize";
    readonly currency: "BZD";
    readonly currencyName: "Belize Dollar";
}, {
    readonly country: "CA";
    readonly countryName: "Canada";
    readonly currency: "CAD";
    readonly currencyName: "Canadian Dollar";
}, {
    readonly country: "CC";
    readonly countryName: "Cocos (Keeling) Islands";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "CD";
    readonly countryName: "DR Congo";
    readonly currency: "CDF";
    readonly currencyName: "Congolese Franc";
}, {
    readonly country: "CF";
    readonly countryName: "Central African Republic";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "CG";
    readonly countryName: "Congo";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "CH";
    readonly countryName: "Switzerland";
    readonly currency: "CHF";
    readonly currencyName: "Swiss Franc";
}, {
    readonly country: "CI";
    readonly countryName: "Côte d'Ivoire";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "CK";
    readonly countryName: "Cook Islands";
    readonly currency: "NZD";
    readonly currencyName: "New Zealand Dollar";
}, {
    readonly country: "CL";
    readonly countryName: "Chile";
    readonly currency: "CLP";
    readonly currencyName: "Chilean Peso";
}, {
    readonly country: "CM";
    readonly countryName: "Cameroon";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "CN";
    readonly countryName: "China";
    readonly currency: "CNY";
    readonly currencyName: "Chinese Yuan";
}, {
    readonly country: "CO";
    readonly countryName: "Colombia";
    readonly currency: "COP";
    readonly currencyName: "Colombian Peso";
}, {
    readonly country: "CR";
    readonly countryName: "Costa Rica";
    readonly currency: "CRC";
    readonly currencyName: "Costa Rican Colón";
}, {
    readonly country: "CU";
    readonly countryName: "Cuba";
    readonly currency: "CUP";
    readonly currencyName: "Cuban Peso";
}, {
    readonly country: "CV";
    readonly countryName: "Cabo Verde";
    readonly currency: "CVE";
    readonly currencyName: "Cape Verdean Escudo";
}, {
    readonly country: "CW";
    readonly countryName: "Curaçao";
    readonly currency: "ANG";
    readonly currencyName: "Netherlands Antillean Guilder";
}, {
    readonly country: "CX";
    readonly countryName: "Christmas Island";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "CY";
    readonly countryName: "Cyprus";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "CZ";
    readonly countryName: "Czechia";
    readonly currency: "CZK";
    readonly currencyName: "Czech Koruna";
}, {
    readonly country: "DE";
    readonly countryName: "Germany";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "DJ";
    readonly countryName: "Djibouti";
    readonly currency: "DJF";
    readonly currencyName: "Djiboutian Franc";
}, {
    readonly country: "DK";
    readonly countryName: "Denmark";
    readonly currency: "DKK";
    readonly currencyName: "Danish Krone";
}, {
    readonly country: "DM";
    readonly countryName: "Dominica";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "DO";
    readonly countryName: "Dominican Republic";
    readonly currency: "DOP";
    readonly currencyName: "Dominican Peso";
}, {
    readonly country: "DZ";
    readonly countryName: "Algeria";
    readonly currency: "DZD";
    readonly currencyName: "Algerian Dinar";
}, {
    readonly country: "EC";
    readonly countryName: "Ecuador";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "EE";
    readonly countryName: "Estonia";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "EG";
    readonly countryName: "Egypt";
    readonly currency: "EGP";
    readonly currencyName: "Egyptian Pound";
}, {
    readonly country: "EH";
    readonly countryName: "Western Sahara";
    readonly currency: "MAD";
    readonly currencyName: "Moroccan Dirham";
}, {
    readonly country: "ER";
    readonly countryName: "Eritrea";
    readonly currency: "ERN";
    readonly currencyName: "Eritrean Nakfa";
}, {
    readonly country: "ES";
    readonly countryName: "Spain";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "ET";
    readonly countryName: "Ethiopia";
    readonly currency: "ETB";
    readonly currencyName: "Ethiopian Birr";
}, {
    readonly country: "FI";
    readonly countryName: "Finland";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "FJ";
    readonly countryName: "Fiji";
    readonly currency: "FJD";
    readonly currencyName: "Fijian Dollar";
}, {
    readonly country: "FK";
    readonly countryName: "Falkland Islands";
    readonly currency: "FKP";
    readonly currencyName: "Falkland Islands Pound";
}, {
    readonly country: "FM";
    readonly countryName: "Micronesia";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "FO";
    readonly countryName: "Faroe Islands";
    readonly currency: "DKK";
    readonly currencyName: "Danish Krone";
}, {
    readonly country: "FR";
    readonly countryName: "France";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "GA";
    readonly countryName: "Gabon";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "GB";
    readonly countryName: "United Kingdom";
    readonly currency: "GBP";
    readonly currencyName: "British Pound";
}, {
    readonly country: "GD";
    readonly countryName: "Grenada";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "GE";
    readonly countryName: "Georgia";
    readonly currency: "GEL";
    readonly currencyName: "Georgian Lari";
}, {
    readonly country: "GF";
    readonly countryName: "French Guiana";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "GG";
    readonly countryName: "Guernsey";
    readonly currency: "GBP";
    readonly currencyName: "British Pound";
}, {
    readonly country: "GH";
    readonly countryName: "Ghana";
    readonly currency: "GHS";
    readonly currencyName: "Ghanaian Cedi";
}, {
    readonly country: "GI";
    readonly countryName: "Gibraltar";
    readonly currency: "GIP";
    readonly currencyName: "Gibraltar Pound";
}, {
    readonly country: "GL";
    readonly countryName: "Greenland";
    readonly currency: "DKK";
    readonly currencyName: "Danish Krone";
}, {
    readonly country: "GM";
    readonly countryName: "Gambia";
    readonly currency: "GMD";
    readonly currencyName: "Gambian Dalasi";
}, {
    readonly country: "GN";
    readonly countryName: "Guinea";
    readonly currency: "GNF";
    readonly currencyName: "Guinean Franc";
}, {
    readonly country: "GP";
    readonly countryName: "Guadeloupe";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "GQ";
    readonly countryName: "Equatorial Guinea";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "GR";
    readonly countryName: "Greece";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "GS";
    readonly countryName: "South Georgia and the South Sandwich Islands";
    readonly currency: "GBP";
    readonly currencyName: "British Pound";
}, {
    readonly country: "GT";
    readonly countryName: "Guatemala";
    readonly currency: "GTQ";
    readonly currencyName: "Guatemalan Quetzal";
}, {
    readonly country: "GU";
    readonly countryName: "Guam";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "GW";
    readonly countryName: "Guinea-Bissau";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "GY";
    readonly countryName: "Guyana";
    readonly currency: "GYD";
    readonly currencyName: "Guyanaese Dollar";
}, {
    readonly country: "HK";
    readonly countryName: "Hong Kong";
    readonly currency: "HKD";
    readonly currencyName: "Hong Kong Dollar";
}, {
    readonly country: "HM";
    readonly countryName: "Heard Island and McDonald Islands";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "HN";
    readonly countryName: "Honduras";
    readonly currency: "HNL";
    readonly currencyName: "Honduran Lempira";
}, {
    readonly country: "HR";
    readonly countryName: "Croatia";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "HT";
    readonly countryName: "Haiti";
    readonly currency: "HTG";
    readonly currencyName: "Haitian Gourde";
}, {
    readonly country: "HU";
    readonly countryName: "Hungary";
    readonly currency: "HUF";
    readonly currencyName: "Hungarian Forint";
}, {
    readonly country: "ID";
    readonly countryName: "Indonesia";
    readonly currency: "IDR";
    readonly currencyName: "Indonesian Rupiah";
}, {
    readonly country: "IE";
    readonly countryName: "Ireland";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "IL";
    readonly countryName: "Israel";
    readonly currency: "ILS";
    readonly currencyName: "Israeli New Shekel";
}, {
    readonly country: "IM";
    readonly countryName: "Isle of Man";
    readonly currency: "GBP";
    readonly currencyName: "British Pound";
}, {
    readonly country: "IN";
    readonly countryName: "India";
    readonly currency: "INR";
    readonly currencyName: "Indian Rupee";
}, {
    readonly country: "IO";
    readonly countryName: "British Indian Ocean Territory";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "IQ";
    readonly countryName: "Iraq";
    readonly currency: "IQD";
    readonly currencyName: "Iraqi Dinar";
}, {
    readonly country: "IR";
    readonly countryName: "Iran";
    readonly currency: "IRR";
    readonly currencyName: "Iranian Rial";
}, {
    readonly country: "IS";
    readonly countryName: "Iceland";
    readonly currency: "ISK";
    readonly currencyName: "Icelandic Króna";
}, {
    readonly country: "IT";
    readonly countryName: "Italy";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "JE";
    readonly countryName: "Jersey";
    readonly currency: "GBP";
    readonly currencyName: "British Pound";
}, {
    readonly country: "JM";
    readonly countryName: "Jamaica";
    readonly currency: "JMD";
    readonly currencyName: "Jamaican Dollar";
}, {
    readonly country: "JO";
    readonly countryName: "Jordan";
    readonly currency: "JOD";
    readonly currencyName: "Jordanian Dinar";
}, {
    readonly country: "JP";
    readonly countryName: "Japan";
    readonly currency: "JPY";
    readonly currencyName: "Japanese Yen";
}, {
    readonly country: "KE";
    readonly countryName: "Kenya";
    readonly currency: "KES";
    readonly currencyName: "Kenyan Shilling";
}, {
    readonly country: "KG";
    readonly countryName: "Kyrgyzstan";
    readonly currency: "KGS";
    readonly currencyName: "Kyrgystani Som";
}, {
    readonly country: "KH";
    readonly countryName: "Cambodia";
    readonly currency: "KHR";
    readonly currencyName: "Cambodian Riel";
}, {
    readonly country: "KI";
    readonly countryName: "Kiribati";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "KM";
    readonly countryName: "Comoros";
    readonly currency: "KMF";
    readonly currencyName: "Comorian Franc";
}, {
    readonly country: "KN";
    readonly countryName: "Saint Kitts and Nevis";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "KP";
    readonly countryName: "North Korea";
    readonly currency: "KPW";
    readonly currencyName: "North Korean Won";
}, {
    readonly country: "KR";
    readonly countryName: "South Korea";
    readonly currency: "KRW";
    readonly currencyName: "South Korean Won";
}, {
    readonly country: "KW";
    readonly countryName: "Kuwait";
    readonly currency: "KWD";
    readonly currencyName: "Kuwaiti Dinar";
}, {
    readonly country: "KY";
    readonly countryName: "Cayman Islands";
    readonly currency: "KYD";
    readonly currencyName: "Cayman Islands Dollar";
}, {
    readonly country: "KZ";
    readonly countryName: "Kazakhstan";
    readonly currency: "KZT";
    readonly currencyName: "Kazakhstani Tenge";
}, {
    readonly country: "LA";
    readonly countryName: "Laos";
    readonly currency: "LAK";
    readonly currencyName: "Laotian Kip";
}, {
    readonly country: "LB";
    readonly countryName: "Lebanon";
    readonly currency: "LBP";
    readonly currencyName: "Lebanese Pound";
}, {
    readonly country: "LC";
    readonly countryName: "Saint Lucia";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "LI";
    readonly countryName: "Liechtenstein";
    readonly currency: "CHF";
    readonly currencyName: "Swiss Franc";
}, {
    readonly country: "LK";
    readonly countryName: "Sri Lanka";
    readonly currency: "LKR";
    readonly currencyName: "Sri Lankan Rupee";
}, {
    readonly country: "LR";
    readonly countryName: "Liberia";
    readonly currency: "LRD";
    readonly currencyName: "Liberian Dollar";
}, {
    readonly country: "LS";
    readonly countryName: "Lesotho";
    readonly currency: "LSL";
    readonly currencyName: "Lesotho Loti";
}, {
    readonly country: "LT";
    readonly countryName: "Lithuania";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "LU";
    readonly countryName: "Luxembourg";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "LV";
    readonly countryName: "Latvia";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "LY";
    readonly countryName: "Libya";
    readonly currency: "LYD";
    readonly currencyName: "Libyan Dinar";
}, {
    readonly country: "MA";
    readonly countryName: "Morocco";
    readonly currency: "MAD";
    readonly currencyName: "Moroccan Dirham";
}, {
    readonly country: "MC";
    readonly countryName: "Monaco";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "MD";
    readonly countryName: "Moldova";
    readonly currency: "MDL";
    readonly currencyName: "Moldovan Leu";
}, {
    readonly country: "ME";
    readonly countryName: "Montenegro";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "MF";
    readonly countryName: "Saint Martin";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "MG";
    readonly countryName: "Madagascar";
    readonly currency: "MGA";
    readonly currencyName: "Malagasy Ariary";
}, {
    readonly country: "MH";
    readonly countryName: "Marshall Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "MK";
    readonly countryName: "North Macedonia";
    readonly currency: "MKD";
    readonly currencyName: "Macedonian Denar";
}, {
    readonly country: "ML";
    readonly countryName: "Mali";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "MM";
    readonly countryName: "Myanmar";
    readonly currency: "MMK";
    readonly currencyName: "Myanmar Kyat";
}, {
    readonly country: "MN";
    readonly countryName: "Mongolia";
    readonly currency: "MNT";
    readonly currencyName: "Mongolian Tugrik";
}, {
    readonly country: "MO";
    readonly countryName: "Macao";
    readonly currency: "MOP";
    readonly currencyName: "Macanese Pataca";
}, {
    readonly country: "MP";
    readonly countryName: "Northern Mariana Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "MQ";
    readonly countryName: "Martinique";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "MR";
    readonly countryName: "Mauritania";
    readonly currency: "MRU";
    readonly currencyName: "Mauritanian Ouguiya";
}, {
    readonly country: "MS";
    readonly countryName: "Montserrat";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "MT";
    readonly countryName: "Malta";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "MU";
    readonly countryName: "Mauritius";
    readonly currency: "MUR";
    readonly currencyName: "Mauritian Rupee";
}, {
    readonly country: "MV";
    readonly countryName: "Maldives";
    readonly currency: "MVR";
    readonly currencyName: "Maldivian Rufiyaa";
}, {
    readonly country: "MW";
    readonly countryName: "Malawi";
    readonly currency: "MWK";
    readonly currencyName: "Malawian Kwacha";
}, {
    readonly country: "MX";
    readonly countryName: "Mexico";
    readonly currency: "MXN";
    readonly currencyName: "Mexican Peso";
}, {
    readonly country: "MY";
    readonly countryName: "Malaysia";
    readonly currency: "MYR";
    readonly currencyName: "Malaysian Ringgit";
}, {
    readonly country: "MZ";
    readonly countryName: "Mozambique";
    readonly currency: "MZN";
    readonly currencyName: "Mozambican Metical";
}, {
    readonly country: "NA";
    readonly countryName: "Namibia";
    readonly currency: "NAD";
    readonly currencyName: "Namibian Dollar";
}, {
    readonly country: "NC";
    readonly countryName: "New Caledonia";
    readonly currency: "XPF";
    readonly currencyName: "CFP Franc";
}, {
    readonly country: "NE";
    readonly countryName: "Niger";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "NF";
    readonly countryName: "Norfolk Island";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "NG";
    readonly countryName: "Nigeria";
    readonly currency: "NGN";
    readonly currencyName: "Nigerian Naira";
}, {
    readonly country: "NI";
    readonly countryName: "Nicaragua";
    readonly currency: "NIO";
    readonly currencyName: "Nicaraguan Córdoba";
}, {
    readonly country: "NL";
    readonly countryName: "Netherlands";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "NO";
    readonly countryName: "Norway";
    readonly currency: "NOK";
    readonly currencyName: "Norwegian Krone";
}, {
    readonly country: "NP";
    readonly countryName: "Nepal";
    readonly currency: "NPR";
    readonly currencyName: "Nepalese Rupee";
}, {
    readonly country: "NR";
    readonly countryName: "Nauru";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "NU";
    readonly countryName: "Niue";
    readonly currency: "NZD";
    readonly currencyName: "New Zealand Dollar";
}, {
    readonly country: "NZ";
    readonly countryName: "New Zealand";
    readonly currency: "NZD";
    readonly currencyName: "New Zealand Dollar";
}, {
    readonly country: "OM";
    readonly countryName: "Oman";
    readonly currency: "OMR";
    readonly currencyName: "Omani Rial";
}, {
    readonly country: "PA";
    readonly countryName: "Panama";
    readonly currency: "PAB";
    readonly currencyName: "Panamanian Balboa";
}, {
    readonly country: "PE";
    readonly countryName: "Peru";
    readonly currency: "PEN";
    readonly currencyName: "Peruvian Sol";
}, {
    readonly country: "PF";
    readonly countryName: "French Polynesia";
    readonly currency: "XPF";
    readonly currencyName: "CFP Franc";
}, {
    readonly country: "PG";
    readonly countryName: "Papua New Guinea";
    readonly currency: "PGK";
    readonly currencyName: "Papua New Guinean Kina";
}, {
    readonly country: "PH";
    readonly countryName: "Philippines";
    readonly currency: "PHP";
    readonly currencyName: "Philippine Peso";
}, {
    readonly country: "PK";
    readonly countryName: "Pakistan";
    readonly currency: "PKR";
    readonly currencyName: "Pakistani Rupee";
}, {
    readonly country: "PL";
    readonly countryName: "Poland";
    readonly currency: "PLN";
    readonly currencyName: "Polish Złoty";
}, {
    readonly country: "PM";
    readonly countryName: "Saint Pierre and Miquelon";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "PN";
    readonly countryName: "Pitcairn";
    readonly currency: "NZD";
    readonly currencyName: "New Zealand Dollar";
}, {
    readonly country: "PR";
    readonly countryName: "Puerto Rico";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "PS";
    readonly countryName: "Palestine";
    readonly currency: "ILS";
    readonly currencyName: "Israeli New Shekel";
}, {
    readonly country: "PT";
    readonly countryName: "Portugal";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "PW";
    readonly countryName: "Palau";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "PY";
    readonly countryName: "Paraguay";
    readonly currency: "PYG";
    readonly currencyName: "Paraguayan Guarani";
}, {
    readonly country: "QA";
    readonly countryName: "Qatar";
    readonly currency: "QAR";
    readonly currencyName: "Qatari Riyal";
}, {
    readonly country: "RE";
    readonly countryName: "Réunion";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "RO";
    readonly countryName: "Romania";
    readonly currency: "RON";
    readonly currencyName: "Romanian Leu";
}, {
    readonly country: "RS";
    readonly countryName: "Serbia";
    readonly currency: "RSD";
    readonly currencyName: "Serbian Dinar";
}, {
    readonly country: "RU";
    readonly countryName: "Russia";
    readonly currency: "RUB";
    readonly currencyName: "Russian Ruble";
}, {
    readonly country: "RW";
    readonly countryName: "Rwanda";
    readonly currency: "RWF";
    readonly currencyName: "Rwandan Franc";
}, {
    readonly country: "SA";
    readonly countryName: "Saudi Arabia";
    readonly currency: "SAR";
    readonly currencyName: "Saudi Riyal";
}, {
    readonly country: "SB";
    readonly countryName: "Solomon Islands";
    readonly currency: "SBD";
    readonly currencyName: "Solomon Islands Dollar";
}, {
    readonly country: "SC";
    readonly countryName: "Seychelles";
    readonly currency: "SCR";
    readonly currencyName: "Seychellois Rupee";
}, {
    readonly country: "SD";
    readonly countryName: "Sudan";
    readonly currency: "SDG";
    readonly currencyName: "Sudanese Pound";
}, {
    readonly country: "SE";
    readonly countryName: "Sweden";
    readonly currency: "SEK";
    readonly currencyName: "Swedish Krona";
}, {
    readonly country: "SG";
    readonly countryName: "Singapore";
    readonly currency: "SGD";
    readonly currencyName: "Singapore Dollar";
}, {
    readonly country: "SH";
    readonly countryName: "Saint Helena, Ascension and Tristan da Cunha";
    readonly currency: "SHP";
    readonly currencyName: "Saint Helena Pound";
}, {
    readonly country: "SI";
    readonly countryName: "Slovenia";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "SJ";
    readonly countryName: "Svalbard and Jan Mayen";
    readonly currency: "NOK";
    readonly currencyName: "Norwegian Krone";
}, {
    readonly country: "SK";
    readonly countryName: "Slovakia";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "SL";
    readonly countryName: "Sierra Leone";
    readonly currency: "SLE";
    readonly currencyName: "Sierra Leonean Leone";
}, {
    readonly country: "SM";
    readonly countryName: "San Marino";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "SN";
    readonly countryName: "Senegal";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "SO";
    readonly countryName: "Somalia";
    readonly currency: "SOS";
    readonly currencyName: "Somali Shilling";
}, {
    readonly country: "SR";
    readonly countryName: "Suriname";
    readonly currency: "SRD";
    readonly currencyName: "Surinamese Dollar";
}, {
    readonly country: "SS";
    readonly countryName: "South Sudan";
    readonly currency: "SSP";
    readonly currencyName: "South Sudanese Pound";
}, {
    readonly country: "ST";
    readonly countryName: "São Tomé and Príncipe";
    readonly currency: "STN";
    readonly currencyName: "São Tomé and Príncipe Dobra";
}, {
    readonly country: "SV";
    readonly countryName: "El Salvador";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "SX";
    readonly countryName: "Sint Maarten";
    readonly currency: "ANG";
    readonly currencyName: "Netherlands Antillean Guilder";
}, {
    readonly country: "SY";
    readonly countryName: "Syria";
    readonly currency: "SYP";
    readonly currencyName: "Syrian Pound";
}, {
    readonly country: "SZ";
    readonly countryName: "Eswatini";
    readonly currency: "SZL";
    readonly currencyName: "Swazi Lilangeni";
}, {
    readonly country: "TC";
    readonly countryName: "Turks and Caicos Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "TD";
    readonly countryName: "Chad";
    readonly currency: "XAF";
    readonly currencyName: "Central African CFA Franc";
}, {
    readonly country: "TF";
    readonly countryName: "French Southern Territories";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "TG";
    readonly countryName: "Togo";
    readonly currency: "XOF";
    readonly currencyName: "West African CFA Franc";
}, {
    readonly country: "TH";
    readonly countryName: "Thailand";
    readonly currency: "THB";
    readonly currencyName: "Thai Baht";
}, {
    readonly country: "TJ";
    readonly countryName: "Tajikistan";
    readonly currency: "TJS";
    readonly currencyName: "Tajikistani Somoni";
}, {
    readonly country: "TK";
    readonly countryName: "Tokelau";
    readonly currency: "NZD";
    readonly currencyName: "New Zealand Dollar";
}, {
    readonly country: "TL";
    readonly countryName: "Timor-Leste";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "TM";
    readonly countryName: "Turkmenistan";
    readonly currency: "TMT";
    readonly currencyName: "Turkmenistani Manat";
}, {
    readonly country: "TN";
    readonly countryName: "Tunisia";
    readonly currency: "TND";
    readonly currencyName: "Tunisian Dinar";
}, {
    readonly country: "TO";
    readonly countryName: "Tonga";
    readonly currency: "TOP";
    readonly currencyName: "Tongan Paʻanga";
}, {
    readonly country: "TR";
    readonly countryName: "Turkey";
    readonly currency: "TRY";
    readonly currencyName: "Turkish Lira";
}, {
    readonly country: "TT";
    readonly countryName: "Trinidad and Tobago";
    readonly currency: "TTD";
    readonly currencyName: "Trinidad and Tobago Dollar";
}, {
    readonly country: "TV";
    readonly countryName: "Tuvalu";
    readonly currency: "AUD";
    readonly currencyName: "Australian Dollar";
}, {
    readonly country: "TW";
    readonly countryName: "Taiwan";
    readonly currency: "TWD";
    readonly currencyName: "New Taiwan Dollar";
}, {
    readonly country: "TZ";
    readonly countryName: "Tanzania";
    readonly currency: "TZS";
    readonly currencyName: "Tanzanian Shilling";
}, {
    readonly country: "UA";
    readonly countryName: "Ukraine";
    readonly currency: "UAH";
    readonly currencyName: "Ukrainian Hryvnia";
}, {
    readonly country: "UG";
    readonly countryName: "Uganda";
    readonly currency: "UGX";
    readonly currencyName: "Ugandan Shilling";
}, {
    readonly country: "UM";
    readonly countryName: "United States Minor Outlying Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "US";
    readonly countryName: "United States";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "UY";
    readonly countryName: "Uruguay";
    readonly currency: "UYU";
    readonly currencyName: "Uruguayan Peso";
}, {
    readonly country: "UZ";
    readonly countryName: "Uzbekistan";
    readonly currency: "UZS";
    readonly currencyName: "Uzbekistani Som";
}, {
    readonly country: "VA";
    readonly countryName: "Vatican City";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "VC";
    readonly countryName: "Saint Vincent and the Grenadines";
    readonly currency: "XCD";
    readonly currencyName: "East Caribbean Dollar";
}, {
    readonly country: "VE";
    readonly countryName: "Venezuela";
    readonly currency: "VES";
    readonly currencyName: "Venezuelan Bolívar";
}, {
    readonly country: "VG";
    readonly countryName: "British Virgin Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "VI";
    readonly countryName: "United States Virgin Islands";
    readonly currency: "USD";
    readonly currencyName: "US Dollar";
}, {
    readonly country: "VN";
    readonly countryName: "Vietnam";
    readonly currency: "VND";
    readonly currencyName: "Vietnamese Dong";
}, {
    readonly country: "VU";
    readonly countryName: "Vanuatu";
    readonly currency: "VUV";
    readonly currencyName: "Vanuatu Vatu";
}, {
    readonly country: "WF";
    readonly countryName: "Wallis and Futuna";
    readonly currency: "XPF";
    readonly currencyName: "CFP Franc";
}, {
    readonly country: "WS";
    readonly countryName: "Samoa";
    readonly currency: "WST";
    readonly currencyName: "Samoan Tala";
}, {
    readonly country: "YE";
    readonly countryName: "Yemen";
    readonly currency: "YER";
    readonly currencyName: "Yemeni Rial";
}, {
    readonly country: "YT";
    readonly countryName: "Mayotte";
    readonly currency: "EUR";
    readonly currencyName: "Euro";
}, {
    readonly country: "ZA";
    readonly countryName: "South Africa";
    readonly currency: "ZAR";
    readonly currencyName: "South African Rand";
}, {
    readonly country: "ZM";
    readonly countryName: "Zambia";
    readonly currency: "ZMW";
    readonly currencyName: "Zambian Kwacha";
}, {
    readonly country: "ZW";
    readonly countryName: "Zimbabwe";
    readonly currency: "ZWL";
    readonly currencyName: "Zimbabwean Dollar";
}];
type CountryCodeLiteral = (typeof COUNTRY_CURRENCY_LIST)[number]['country'];
type FiatCurrencyCodeLiteral = (typeof COUNTRY_CURRENCY_LIST)[number]['currency'];
/** Self-mapped enum object: `CountryCode.GB === 'GB'` — dotted, autocomplete-able code access. */
export declare const CountryCode: { [K in CountryCodeLiteral]: K; };
export type CountryCode = (typeof CountryCode)[keyof typeof CountryCode];
/** Self-mapped enum object: `FiatCurrencyCode.EUR === 'EUR'`. Deduped — many countries share a currency. */
export declare const FiatCurrencyCode: { [K in FiatCurrencyCodeLiteral]: K; };
export type FiatCurrencyCode = (typeof FiatCurrencyCode)[keyof typeof FiatCurrencyCode];
/** Code -> display name. */
export declare const COUNTRY_NAMES: { [K in CountryCodeLiteral]: string; };
/** Code -> display name (deduped, one entry per currency regardless of how many countries share it). */
export declare const FIAT_CURRENCY_NAMES: { [K in FiatCurrencyCodeLiteral]: string; };
/** A country's primary/official currency. */
export declare const COUNTRY_TO_CURRENCY: { [K in CountryCodeLiteral]: FiatCurrencyCodeLiteral; };
/** fun-backend/provider vocabulary, not a standard — extend when a new payment rail ships. */
export declare const PAYMENT_METHOD_CATEGORIES: readonly ["card", "apple_pay", "google_pay", "bank_transfer"];
export type PaymentMethodCategory = (typeof PAYMENT_METHOD_CATEGORIES)[number];
export {};
