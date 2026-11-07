# 블로그 수정 시 참고

- 먼저 `README.md`의 화면 → 파일 표와 `docs/blog-guide.md`를 확인합니다.
- 이 저장소는 Jekyll/Chirpy 블로그입니다. 기존 체크아웃을 사용합니다. 사용자가 요청하지 않으면 별도 worktree를 만들지 않습니다.
- `_tabs/`는 소개·전체 목차 페이지이고, `topics/`는 여섯 주제의 개별 목록입니다. 둘을 혼동하지 않습니다.
- 주제의 순서·표시 이름은 `_data/topics.yml`에 있습니다. `slug`는 `topics/<slug>.md`, `_posts/<slug>/`와 대응합니다.
- 글은 `_posts/`의 주제별 폴더에 둡니다. 폴더 이동만으로 화면의 분류가 바뀌지는 않습니다. 글의 `categories`와 주제 페이지의 `title`을 확인합니다.
- 주제 이름을 바꾸면 데이터, 주제 페이지의 title, 기존 글의 categories를 함께 점검합니다. 기존 permalink와 `/posts/<slug>/` 주소는 요청 없이 변경하지 않습니다.
- 티스토리에서 옮긴 HTML 글은 원문 보존을 요청받은 자료입니다. 사용자 요청 없이 문장·코드·사진·`{% raw %}` 구간을 고치지 않습니다.
- 기존 글을 수정할 때 파일의 날짜나 이름을 임의로 바꾸지 않습니다. 다른 사용자의 변경을 보존합니다.
- 디자인은 `assets/css/notebook.css`, 홈 닥스훈트는 `_includes/dachshund.svg`, 스크롤바 동작은 `assets/js/dog-scrollbar.js`에서 관리합니다.
- 이 클라우드에서는 `export PATH=/workspace/.runtime/ruby/bin:$PATH` 후 `bash tools/test.sh`로 빌드·내부 링크를 검사합니다. 동작 변경은 브라우저로 확인합니다.
- 글 이동 시 원문 동일성, 공개 URL, 카테고리 목록을 확인합니다. README의 파일 링크도 유지합니다.
- 커밋·푸시·배포는 현재 사용자가 요청한 범위에서 진행하고, 공개 배포 성공과 로컬 검증을 구분해 보고합니다.
