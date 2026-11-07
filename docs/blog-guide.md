# PX 블로그 관리

Jekyll과 Chirpy의 빌드 환경을 유지하고, `_layouts/`와 `assets/css/notebook.css`에서 화면을 구성합니다. JavaScript나 외부 폰트 서비스 없이 메뉴와 글 목록을 이용할 수 있습니다.

## 글 작성

주제에 맞는 폴더의 `YYYY-MM-DD-slug.md` (예: `_posts/ctf-wargame/YYYY-MM-DD-slug.md`)에 글을 추가합니다. 다음은 작성 형식 예시이며 공개용 샘플 글은 아닙니다.

```yaml
---
title: "글 제목"
description: "글의 내용을 설명하는 짧은 문장"
date: YYYY-MM-DD HH:MM:SS +0900
categories: ["CTF/Wargame"]
tags: [web, security]
---
```

날짜는 실제 작성일로 바꿉니다. 카테고리는 `개발`, `CTF/Wargame`, `Bug Bounty`, `블로그/기술문서`, `논문/컨퍼런스`, `공모전/자격증` 중에서 선택합니다. 공백과 슬래시를 포함한 이름은 위 예시처럼 따옴표와 배열로 지정합니다. 다른 이름도 사용할 수 있으며 주제 페이지 하단에 추가됩니다.

폴더는 파일을 찾기 위한 정리 기준입니다. 화면의 분류는 글 상단의 `categories`가 결정하므로 폴더만 옮겨서는 분류가 바뀌지 않습니다.

티스토리에서 가져온 원문은 `_posts/documentation/2026-05-18-atomic-red-team-bas.html`입니다. HTML 원문과 `{% raw %}` 구간을 보존하고, 새 글은 Markdown(`.md`)으로 작성하면 됩니다.

첫 문단이나 `description`이 글 목록의 요약에 표시됩니다. 본문에는 일반적인 Markdown, 코드 블록, 이미지, 표, 각주를 사용할 수 있습니다. 아직 공개한 글이 없을 때는 빈 목록 안내를 표시합니다.

## 메뉴와 디자인

- 주제 이름과 설명: `_data/topics.yml`
- 주제별 페이지: `topics/`
- 자기소개: `_tabs/about.md`
- 공통 메뉴와 푸터: `_layouts/default.html`
- 배경·글자·포인트 색: `assets/css/notebook.css`의 `:root`

배경 `#110C09`, 기본 글자 `#FDE2CC`, 강조 글자 `#B5762E`를 사용합니다. 홈의 작은 닥스훈트 그림은 `_includes/dachshund.svg`에서 관리합니다. 서체는 첨부받은 SUIT를 `assets/fonts/suit/`에서 자체 제공합니다. Thin(100)부터 Heavy(900)까지 아홉 굵기의 원본 TTF와 첨부된 라이선스 전문을 보관합니다. 코드 블록은 고정폭 글꼴을 유지합니다.

제목과 메뉴에는 짧은 명사형을 쓰고, 본문에는 자연스러운 문장을 사용합니다. 새로운 활동 이력, 문제 풀이, 수상 내역은 실제 기록이 있을 때 추가합니다.

## 로컬 확인

Ruby 3.4 환경에서 실행합니다.

```sh
bundle config set --local path vendor/bundle
bundle install --jobs 4
bash tools/test.sh
bash tools/run.sh
```

`tools/test.sh`는 프로덕션 빌드와 내부 링크 검사를 실행합니다. 공개 배포는 기존 GitHub Actions의 Pages 워크플로를 사용합니다.

## 참고 자료

- [Impeccable](https://github.com/pbakaus/impeccable): 반복 카드, 획일적인 폰트와 그라데이션 등 디자인 관행 검토
- [fluent-korean](https://github.com/snflkd/fluent-korean): 의미가 분명한 한국어 문장
- [im-not-ai](https://github.com/epoko77-ai/im-not-ai): 과장, 번역투, 반복 문구 점검
