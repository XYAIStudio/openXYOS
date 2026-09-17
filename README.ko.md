# openXYOS

**Languages:** [簡體中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md) · [설치 언어 색인](docs/i18n/README.md) · [현지화 정책](docs/i18n/POLICY.md)

소스 저장소: [github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

openXYOS는 XYOS에서 단순화한, 인간–AI 조직을 위한 오픈 소스 OS입니다. 다계층 조직, 멀티 테넌시, 모듈화, 거버넌스 가능한 인간–AI 협업, 에이전트 맞춤화, 1:1/그룹 채팅, 확장 가능한 예제 모듈을 제공하며 개발자와 커뮤니티가 함께 발전하도록 설계되었습니다.

> 상태: 커뮤니티 릴리스 후보입니다. 로컬 개발·평가·공동 개선용이며 **프로덕션 준비 완료로 표기하지 않습니다**.

## 개발자 커뮤니티

**XYAI Founders** 교류 그룹(기업微信 / WeCom)에 오신 것을 환영합니다. openXYOS 사용·확장·기여를 함께 이야기하세요. WeCom으로 QR을 스캔하세요. 만료되면 [Discussions #12](https://github.com/XYAIStudio/openXYOS/discussions/12)를 확인하세요.

<p align="center">
  <img src="docs/community/assets/xyai-founders-wecom-qr.png" width="240" alt="XYAI Founders WeCom QR" />
</p>

## 실행 범위

로그인 후 12개 모듈을 제공합니다: 워크스페이스, 공지, 조직, 인적·AI 자원, 스킬/플러그인, 협업, 에이전트 스튜디오, 작업, 지식, 회고, 거버넌스, 설정.

테넌트 관리자는 구성 가능 모듈을 켜거나 끄고 표시 이름을 바꿀 수 있습니다. 워크스페이스와 설정은 기본 모듈로 끌 수 없습니다.

## 에이전트 수명 주기

이름·포지셔닝·역량·경험을 정의하고, 승인된 참고 문서를 업로드하며, ima 지식 URL을 선택적으로 연결합니다. 파일은 보안 검사와 텍스트 추출 후 블루프린트에 반영됩니다.

생성된 컨설턴트형 에이전트는 인재 마켓에 자동 등록되고, 채용 후 예비 직원이 되며 관리자가 직무와 부서를 지정할 수 있습니다. 고위험 출력은 기본으로 사람 검토가 필요합니다. ima URL은 커넥터가 검증하기 전까지 “연결됨·미검증”입니다.

## 빠른 시작

Node.js 20.19 이상이 필요합니다.

```bash
npm ci
cp .env.example .env
npm run dev
```

시작 전 시크릿을 교체하세요. 클라이언트: `http://localhost:5174`, API: `http://localhost:3000/api`.

## 검증

```bash
npm run lint
npm run typecheck
npm test
npm run verify:open-source
npm run build
```

[커뮤니티 가이드](docs/community/README.md), [언어 색인](docs/i18n/README.md), [오픈 소스 범위](docs/open-source-scope.md), [보안](SECURITY.md), [기여 안내](CONTRIBUTING.md)를 참고하고, 사용 질문은 [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a)로. [Apache License 2.0](LICENSE).
