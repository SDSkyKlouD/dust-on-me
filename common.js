module.exports = {
    /* Common functions */
    isUsableVar: (obj) => {
        if(typeof(obj) !== "undefined" && obj !== null) {
            return true;
        } else {
            throw new TypeError("isUsableVar: passed object is null or undefined");
        }
    },

    /* PM10/PM2.5 baselines */
    whoPM10DailyBaseline:  50,     // WHO - PM10 daily(24h) baseline                : 50㎍/㎥
    whoPM10YearlyBaseline: 20,     // WHO - PM10 yearly baseline                    : 20㎍/㎥
    whoPM25DailyBaseline:  25,     // WHO - PM2.5 daily(24h) baseline               : 25㎍/㎥
    whoPM25YearlyBaseline: 10,     // WHO - PM2.5 yearly baseline                   : 10㎍/㎥
    kmePM25DailyBaseline:  35,     // Korea Ministry of Env - PM2.5 daily baseline  : 35㎍/㎥
    kmePM25YearlyBaseline: 15,     // Korea Ministry of Env - PM2.5 yearly baseline : 15㎍/㎥

    /* Sido names */
    /* Value - [_short name_, _official full name_, _alternatives_...] */
    sidoNamesKor: {
        "busan":     ["부산", "부산광역시", "부산시", "부산직할시"],
        "chungbuk":  ["충북", "충청북도", "충북도"],
        "chungnam":  ["충남", "충청남도", "충남도"],
        "daegu":     ["대구", "대구광역시", "대구시", "대구직할시"],
        "daejeon":   ["대전", "대전광역시", "대전시", "대전직할시"],
        "gangwon":   ["강원", "강원도"],
        "gwangju":   ["광주", "광주광역시", "광주직할시"],            // No "광주시" - conflict with 광주시 in 경기도
        "gyeongbuk": ["경북", "경상북도", "경북도"],
        "gyeonggi":  ["경기", "경기도"],
        "gyeongnam": ["경남", "경상남도", "경남도"],
        "incheon":   ["인천", "인천광역시", "인천시", "인천직할시"],
        "jeju":      ["제주", "제주특별자치도", "제주도", "제주특별도", "제주자치도"],
        "jeonbuk":   ["전북", "전라북도", "전북도"],
        "jeonnam":   ["전남", "전라남도", "전남도"],
        "sejong":    ["세종", "세종특별자치시", "세종시", "세종특별시", "세종자치시"],
        "seoul":     ["서울", "서울특별시", "서울시", "수도"],
        "ulsan":     ["울산", "울산광역시", "울산시", "울산직할시"]
    }
}

// Korea Ministry of Environment baseline enforced from 2018. 03. 27. / same baseline with USA, Japan, etc.