@AGENTS.md

# MyLink 작업 규칙

- **Firestore 데이터 구조(필드·경로)를 바꾸면 `firestore.rules`도 함께 고친다.** 규칙을 바꾸면 `scripts/test-firestore-rules.mjs`에 경우를 추가하고, `firebase deploy --only firestore:rules --project my-dae-link`로 배포한 뒤 테스트를 다시 돌린다. (13주차: clickCount 추가 → 방문자 +1 허용 규칙)
- 바뀐 내용은 `PRD.md`에 같이 기록한다.
