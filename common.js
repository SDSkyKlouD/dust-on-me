module.exports = {
    /* Common functions */
    isUsableVar: (obj) => {
        if(typeof(obj) !== "undefined" && obj !== null) {
            return true;
        } else {
            throw new TypeError("isUsableVar: passed object is null or undefined");
        }
    },
    uptime: () => {
        let uptime = process.uptime();

        return {
            fullSeconds:    Math.floor(uptime),
            seconds:        Math.floor(uptime % 60),
            minutes:        Math.floor(uptime % 3600  / 60),
            hours:          Math.floor(uptime % 86400 / 3600),
            days:           Math.floor(uptime / 86400)
        };
    },
    
    /* Common constants */
    gitRevision: require("child_process").execSync("git rev-parse --short HEAD", { cwd: __dirname }).toString().trim(),

    /* PM10/PM2.5 baselines */
    whoPM10DailyBaseline:  50,     // WHO - PM10 daily(24h) baseline                : 50㎍/㎥
    whoPM10YearlyBaseline: 20,     // WHO - PM10 yearly baseline                    : 20㎍/㎥
    whoPM25DailyBaseline:  25,     // WHO - PM2.5 daily(24h) baseline               : 25㎍/㎥
    whoPM25YearlyBaseline: 10,     // WHO - PM2.5 yearly baseline                   : 10㎍/㎥
    kmePM25DailyBaseline:  35,     // Korea Ministry of Env - PM2.5 daily baseline  : 35㎍/㎥
    kmePM25YearlyBaseline: 15,     // Korea Ministry of Env - PM2.5 yearly baseline : 15㎍/㎥
    // Korea Ministry of Environment baseline enforced from 2018. 03. 27. / same baseline with USA, Japan, etc.

    /* Units */
    PMDustUnit : "㎍/㎥",

    /* Sido names */
    // Value: [_short name_, _official full name_, _keywords for mention command_...]
    sidoNamesKor: {
        "seoul":     ["서울", "서울특별시", "서울시", "수도",
                      "경성", "한양", "위례성", "한산주",
                      "한볕", "우리", "아리"],
        "incheon":   ["인천", "인천광역시", "인천시", "인천직할시",
                      "미추홀", "매소홀", "미숫골"],
        "daegu":     ["대구", "대구광역시", "대구시", "대구직할시",
                      "공산", "다벌", "달벌", "달구벌", "다구벌"],
        "daejeon":   ["대전", "대전광역시", "대전시", "대전직할시",
                      "탄현", "한밭"],
        "gwangju":   ["광주", "광주광역시", "광주직할시",               // No "광주시" - conflict with 광주시 in 경기도
                      "무진주", "노기", "빛고을"],            
        "busan":     ["부산", "부산광역시", "부산시", "부산직할시",
                      "동래", "가마뫼"],
        "ulsan":     ["울산", "울산광역시", "울산시", "울산직할시",
                      "우진야성", "울뫼"],
        "sejong":    ["세종", "세종특별자치시", "세종시", "세종특별시", "세종자치시",
                      "두나기", "두잉지"],
        "jeju":      ["제주", "제주특별자치도", "제주도", "제주특별도", "제주자치도",
                      "탐라", "탐라국", "탐라섬", "담모라섬", "탐모라섬"],
        "gyeonggi":  ["경기", "경기도"],
        "gangwon":   ["강원", "강원도"],
        "gyeongbuk": ["경북", "경상북도", "경북도"],
        "gyeongnam": ["경남", "경상남도", "경남도"],
        "chungbuk":  ["충북", "충청북도", "충북도"],
        "chungnam":  ["충남", "충청남도", "충남도"],
        "jeonbuk":   ["전북", "전라북도", "전북도"],
        "jeonnam":   ["전남", "전라남도", "전남도"],
    },
    sidoNamesEng: {     // Space char will be ignored when processing a mention command
        "busan":     ["Busan", "Busan Metropolitan City",
                      "BusanCity", "BusanSi", "Busan-si", "BusanGwangyeoksi", "BusanJikhalsi",
                      "Pusan", "PusanMetropolitanCity",
                      "PusanCity", "PusanSi", "Pusan-si", "PusanGwangyeoksi", "PusanJikhalsi"],
        "chungbuk":  ["Chungbuk", "North Chungcheong Province",
                      "Chungcheongbukdo", "Chungbuk-do", "Chungbukdo",
                      "Chungcheongbuk-do", "ChungcheongbukProvince", "ChungbukProvince",
                      "NorthChungcheongdo", "NorthChungcheong-do"],
        "chungnam":  ["Chungnam", "South Chungcheong Province",
                      "Chungcheongnamdo", "Chungnam-do", "Chungnamdo",
                      "Chungcheongnam-do", "ChungcheongnamProvince", "ChungnamProvince",
                      "SouthChungcheongdo", "SouthChungcheong-do"],
        "daegu":     ["Daegu", "Daegu Metropolitan City",
                      "DaeguCity", "DaeguSi", "Daegu-si", "DaeguGwangyeoksi", "DaeguJikhalsi",
                      "Taegu", "TaeguMetropolitanCity",
                      "TaeguCity", "TaeguSi", "Taegu-si", "TaeguGwangyeoksi", "TaeguJikhalsi"],
        "daejeon":   ["Daejeon", "Daejeon Metropolitan City",
                      "DaejeonCity", "DaejeonSi", "Daejeon-si", "DaejeonGwangyeoksi", "DaejeonJikhalsi",
                      "Taejon", "TaejonMetropolitanCity",
                      "TaejonCity", "TaejonSi", "Taejon-si", "TaejonGwangyeoksi", "TaejonJikhalsi"],
        "gangwon":   ["Gangwon", "Gangwon Province",
                      "Gangwondo", "Gangwon-do",
                      "Kangwon", "Kangwon-do",
                      "Kangwondo", "Kangwon Province"],
        "gwangju":   ["Gwangju", "Gwangju Metropolitan City",
                      "GwangjuCity", "GwangjuGwangyeoksi", "GwangjuJikhalsi",
                      "Kwangju", "KwangjuMetropolitanCity",
                      "KwangjuCity", "KwangjuGwangyeoksi", "KwangjuJikhalsi"],
        "gyeongbuk": ["Gyeongbuk", "North Gyeongsang Province",
                      "Gyeongsangbukdo", "Gyeongbuk-do", "Gyeongbukdo",
                      "Gyeongsangbuk-do", "GyeongsangbukProvince", "GyeongbukProvince",
                      "NorthGyeongsangdo", "NorthGyeongsang-do",
                      "Kyeongbuk", "North Kyeongsang Province",
                      "Kyeongsangbukdo", "Kyeongbuk-do", "Kyeongbukdo",
                      "Kyeongsangbuk-do", "KyeongsangbukProvince", "KyeongbukProvince",
                      "NorthKyeongsangdo", "NorthKyeongsang-do"],
        "gyeonggi":  ["Gyeonggi", "Gyeonggi Province",
                      "Gyeonggido", "Gyeonggi-do",
                      "Kyeonggi", "Kyeonggi-do",
                      "Kyeonggido", "Kyeonggi Province"],
        "gyeongnam": ["Gyeongnam", "South Gyeongsang Province",
                      "Gyeongsangnamdo", "Gyeongnam-do", "Gyeongnamdo",
                      "Gyeongsangnam-do", "GyeongsangnamProvince", "GyeongnamProvince",
                      "SouthGyeongsangdo", "SouthGyeongsang-do",
                      "Kyeongnam", "South Kyeongsang Province",
                      "Kyeongsangnamdo", "Kyeongnam-do", "Kyeongnamdo",
                      "Kyeongsangnam-do", "KyeongsangnamProvince", "KyeongnamProvince",
                      "SouthKyeongsangdo", "SouthKyeongsang-do"],
        "incheon":   ["Incheon", "Incheon Metropolitan City",
                      "IncheonCity", "IncheonSi", "Incheon-si", "IncheonGwangyeoksi", "IncheonJikhalsi",
                      "Inchon", "InchonMetropolitanCity",
                      "InchonCity", "InchonSi", "Inchon-si", "InchonGwangyeoksi", "InchonJikhalsi"],
        "jeju":      ["Jeju", "Jeju Special Autonomous Province",
                      "Jejudo", "Jeju-do", "JejuProvince", "JejuSpecialProvince",
                      "JejuTeukbyeolJachido", "JejuTeukbyeolJachi-do", "JejuTeukbyeolJachiProvince"],
        "jeonbuk":   ["Jeonbuk", "North Jeolla Province",
                      "Jeollabukdo", "Jeonbuk-do", "Jeonbukdo",
                      "Jeollabuk-do", "JeollabukProvince", "JeonbukProvince",
                      "NorthJeollado", "NorthJeolla-do"],
        "jeonnam":   ["Jeonnam", "South Jeolla Province",
                      "Jeollanamdo", "Jeonnam-do", "Jeonnamdo",
                      "Jeollanam-do", "JeollanamProvince", "JeonnamProvince",
                      "SouthJeollado", "SouthJeolla-do"],
        "sejong":    ["Sejong", "Sejong Special Autonomous City",
                      "SejongCity", "SejongSi", "Sejong-si", "SejongSpecialCity",
                      "SejongAutonomousCity", "SejongTeukbyeolJachisi", "SejongTeukbyeolJachi-si"],
        "seoul":     ["Seoul", "Seoul Special City",
                      "SeoulCity", "SeoulSi", "Seoul-si",
                      "SeoulTeukbyeolsi", "SeoulTeukbyeol-si", "Sudo", "Capital", "CapitalCity"],
        "ulsan":     ["Ulsan", "Ulsan Metropolitan City",
                      "UlsanCity", "UlsanSi", "Ulsan-si", "UlsanGwangyeoksi", "UlsanJikhalsi"]
    }
}