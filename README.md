dust-on-me
==========
시/도별 미세먼지 상태를 매 시간 [에어코리아](https://www.airkorea.or.kr) OpenAPI로부터 조회하여 트윗하는 봇입니다.  
**더 이상 진행되지 않는 프로젝트입니다.**  

필요 사항
========
  + Node.js *- LTS v10.16.x에서 테스트 완료*
  + 트위터 개발자 계정 및 앱 등록 *- 하는 방법은 검색해보세요!*
  + 인터넷 연결

설치
====
1. Git clone
    ```sh
    $ git clone https://github.com/SDSkyKlouD/dust-on-me
    ```
2. 모듈 설치
   ```sh
   $ cd dust-on-me
   $ npm install
   ```
3. `config.js` 생성
   ```sh
   $ cp config.example.js config.js
   $ nano config.js  # 혹은 선호하는 편집기를 이용하여 설정 파일 수정
   ```
4. 실행
   ```sh
   $ npm start
   # 혹은
   $ node .
   # 혹은
   $ node bot.js
   ```

라이선스
========
[MIT](LICENSE.md)