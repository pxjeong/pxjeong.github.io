# PX · 개발과 보안 학습 노트

[블로그 열기](https://pxjeong.github.io/) · [글 작성 자세히 보기](docs/blog-guide.md)

## 무엇을 수정하고 싶은가요?

| 화면에서 보이는 부분 | 수정할 파일 | 수정할 내용 |
| --- | --- | --- |
| 자기소개 | [_tabs/about.md](_tabs/about.md) | 아래쪽 본문 |
| 홈의 큰 제목·소개 문구 | [_layouts/home.html](_layouts/home.html) | `배운 것과`, `intro-description` 부분 |
| 여섯 주제의 이름·설명·순서 | [_data/topics.yml](_data/topics.yml) | `name`, `description`, 위아래 순서 |
| 블로그 이름·계정·기본 정보 | [_config.yml](_config.yml) | `title`, `social` 등 |
| 상단 메뉴·하단 링크 | [_layouts/default.html](_layouts/default.html) | `nav`, `site-footer` 부분 |
| 색깔·크기·여백 | [assets/css/notebook.css](assets/css/notebook.css) | 색깔은 맨 위 `:root` |
| 홈의 닥스훈트 그림 | [_includes/dachshund.svg](_includes/dachshund.svg) | SVG 모양과 색깔 |
| 꼬리·하트 효과 | [assets/css/notebook.css](assets/css/notebook.css), [assets/js/dachshund.js](assets/js/dachshund.js) | `tail-wag`, `heart-float`, 클릭 반응 |
| 닥스훈트 스크롤바 | [assets/js/dog-scrollbar.js](assets/js/dog-scrollbar.js) | 몸통 길이와 스크롤 동작 |
| 글에 들어가는 사진 | [assets/img/posts/](assets/img/posts/) | 글별 이미지 폴더 |

**`_tabs/about.md`는 소개 페이지입니다. 개발·CTF 같은 학습 주제는 아래 `topics/`에 있습니다.**

## 여섯 주제와 파일 위치

| 블로그의 주제 | 글을 작성하는 폴더 | 해당 주제의 목차 페이지 |
| --- | --- | --- |
| 개발 | [_posts/development/](_posts/development/) | [topics/development.md](topics/development.md) |
| CTF/Wargame | [_posts/ctf-wargame/](_posts/ctf-wargame/) | [topics/ctf-wargame.md](topics/ctf-wargame.md) |
| Bug Bounty | [_posts/bug-bounty/](_posts/bug-bounty/) | [topics/bug-bounty.md](topics/bug-bounty.md) |
| 블로그/기술문서 | [_posts/documentation/](_posts/documentation/) | [topics/documentation.md](topics/documentation.md) |
| 논문/컨퍼런스 | [_posts/research/](_posts/research/) | [topics/research.md](topics/research.md) |
| 공모전/자격증 | [_posts/activities/](_posts/activities/) | [topics/activities.md](topics/activities.md) |

`topics/`는 글을 모아 보여 주는 **목차**이고, `_posts/`는 실제 **글 본문**입니다. `topics/`에 글을 쓰지 않아도 새 글은 카테고리에 따라 자동으로 목록에 나타납니다. 빈 폴더의 `.gitkeep`는 폴더를 보관하기 위한 파일입니다. 수정하지 않아도 됩니다.

## GitHub에서 새 글 작성

1. 위 표에서 원하는 `_posts/` 폴더를 엽니다.
2. **Add file → Create new file**을 누릅니다.
3. 파일 이름을 `YYYY-MM-DD-영문-제목.md` 형태로 정합니다. 날짜는 실제 작성일로 바꿉니다.
4. 다음 형식을 붙여 넣고 제목·날짜·카테고리·본문을 작성합니다.

```markdown
---
title: "글 제목"
date: YYYY-MM-DD HH:MM:SS +0900
categories: ["개발"]
tags: []
---

여기부터 본문을 작성합니다.
```

5. **Commit changes**로 저장합니다. `main`에 반영되면 **Actions → Build and Deploy**에서 빌드·게시가 자동 진행됩니다. 성공 표시 후 블로그에서 확인합니다.

**카테고리는 위 표의 한글·영문 이름과 정확히 맞춥니다.** 예를 들어 CTF 글은 `categories: ["CTF/Wargame"]`입니다. 폴더는 파일 정리용이고 실제 분류는 `categories`가 결정합니다. 공백과 슬래시가 있어도 따옴표 안에 그대로 적습니다.

기존 글을 수정할 때는 파일을 연 뒤 연필 모양의 **Edit** 버튼을 누르면 됩니다. 글을 고치는 것만으로는 날짜나 파일 이름을 바꿀 필요가 없습니다.

## 폴더 역할

- `_posts/`: 내가 쓴 글. 주제별 폴더 안에서 작성·수정
- `topics/`: 여섯 주제의 개별 목차 페이지
- `_tabs/`: 소개·전체 주제 목차·태그·아카이브 페이지
- `_data/`: 주제 이름과 순서 같은 공통 데이터
- `assets/`: 사진, 디자인 CSS, 동작 JavaScript
- `_layouts/`, `_includes/`: 화면 구조와 공통 그림. 디자인을 바꿀 때 수정
- `tools/`, `.github/`: 실행·검사·자동 배포 설정
- `_site/`, `vendor/`, `.bundle/`, `Gemfile.lock`: 로컬 생성 파일. 글 작성 시 수정하지 않음

## 개발 환경에서 실행

Ruby 3.4 환경에서 저장소 폴더로 이동한 뒤 실행합니다. 이 클라우드 환경은 먼저 `export PATH=/workspace/.runtime/ruby/bin:$PATH`를 실행합니다.

```sh
bundle config set --local path vendor/bundle
bundle install --jobs 4
bash tools/test.sh  # 빌드와 내부 링크 검사
bash tools/run.sh   # 로컬 개발 서버
```

Jekyll / [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 기반 · [MIT 라이선스](LICENSE)
