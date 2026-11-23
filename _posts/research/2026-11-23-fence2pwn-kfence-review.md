---
title: "보안을 위한 기능이 오히려 공격에 이용된다면? _ Fence2Pwn 논문 리뷰"
description: "Linux 커널의 KFENCE가 객체 분리와 메모리 태그 보호에 어떤 영향을 주는지 살펴보고, 실험 결과와 설계상의 한계를 정리했다."
date: 2026-11-23 02:09:56 +0900
categories: ["논문/컨퍼런스"]
tags: [linux-kernel, kfence, memory-safety, paper-review]
---

<p><b><span>논문명:</span></b><span> Fence2Pwn: KFENCE-Enabled Kernel Exploitation Bypassing Slab Hardening and Memory Tagging</span></p>
<p><b><span>학회:</span></b><span> USENIX Security Symposium 2026</span></p>
<p><b><span>저자:</span></b><span> Ernesto Mart&iacute;nez Garc&iacute;a, Lukas Maar, Martin Unterguggenberger, Stefan Mangard</span></p>
<p><b><span>분야:</span></b><span> 시스템 보안 / Linux 커널 / 메모리 취약점 분석</span></p>
<div><hr /></div>
<h2><span>1. 이 논문을 선택한 이유</span></h2>
<p><span>평소 시스템 해킹에 관심이 있었고 관련 논문을 찾아보던 중 <b>Fence2Pwn</b>이라는 논문을 알게 되었다.</span></p>
<p><span>시스템 해킹은 운영체제나 프로그램 내부에서 발생하는 취약점을 분석하고 해당 취약점이 실제로 어떤 보안 문제를 일으킬 수 있는지 연구하는 분야다. 그중에서도 커널 해킹은 운영체제의 핵심 부분을 다룬다는 점에서 관심이 갔던거 같다.</span></p>
<p><span><b>Fence2Pwn</b>은 Linux 커널에서 메모리 오류를 탐지하기 위해 만들어진 KFENCE라는 기능을 다룬다.</span></p>
<p><span>처음에는<b> KFENCE</b>가 보안 기능인데 어떻게 공격에 이용될 수 있다는 것인지 이해되지 않았다. 보안을 강화하기 위해 만든 기술이라면 당연히 시스템을 더 안전하게 만들어야 한다고 생각했기 때문이다.</span></p>
<p><span>그런데 논문을 살펴보니 KFENCE가 직접적인 취약점을 만들어내는 것은 아니었다. KFENCE가 메모리를 관리하는 방식 때문에 기존에 적용되던 일부 보안 기능이 제대로 작동하지 않는다는 것이 문제였다.</span></p>
<p><span>특히 연구진은 이러한 특성을 이용해 기존의 메모리 보호 기능을 우회하는 방법을 제시했다.</span></p>
<p><span>단순히 프로그램에서 새로운 버그를 찾아낸 연구가 아니라, 이미 존재하는 보안 기능의 설계와 동작 방식을 분석하여 새로운 공격 가능성을 발견했다는점 때문이다.</span></p>
<p><span>이번 리뷰에서는 Fence2Pwn이 등장한 배경과 핵심 원리를 정리하고 연구진이 어떤 실험으로 검증을 했는지 살펴보려고 한다.&nbsp;</span></p>
<p><span>마지막엔 이 연구의 한계와 앞으로의 할 것을 정해보려고 한다. <s>(감히 내가 연구의 한계를 측정 해봐도 될진 모르겠지만 일단 해보겠다)</s></span></p>
<h2><span>2. 논문을 읽기 전에 생각해 본 문제</span></h2>
<p><span>논문을 본격적으로 살펴보기 전에 세 가지 질문을 먼저 정리했다.</span></p>
<p><b><span>첫 번째는 이 논문이 해결하려는 문제가 무엇인가이다.</span></b></p>
<p><span>Linux 커널은 메모리 공격을 막기 위해 여러 보호 기능을 사용한다. 그런데 이러한 보호 기능들이 모든 메모리 할당 과정에서 똑같이 적용되는지는 확인할 필요가 있다.</span></p>
<p><span>Fence2Pwn은 이 부분에 주목한 논문이다.</span></p>
<p><b><span>두 번째는 이 문제가 왜 중요한가이다.</span></b></p>
<p><span>커널은 운영체제의 핵심 부분이기 때문이다. 일반 프로그램에서 발생한 오류는 해당 프로그램에 영향을 주는 경우가 많지만, 커널의 취약점은 시스템 전체의 보안 문제로 이어질 수 있다.</span></p>
<p><span>특히 일반 사용자 권한으로 실행한 프로그램이 커널 취약점을 이용해 관리자 수준의 권한을 얻게 된다면 피해가 커질 수 있다.</span></p>
<p><b><span>세 번째는 기존 방식에 어떤 부족한 점이 있었는가이다.</span></b></p>
<p><span>기존의 커널 보안 기술은 주로 일반적인 메모리 할당 경로를 보호하도록 발전해 왔다.</span></p>
<p><span>하지만 KFENCE처럼 특별한 방식으로 메모리를 할당하는 기능이 존재한다면, 그 경로에서도 동일한 보호가 이루어지는지 확인해야 한다.</span></p>
<h2><span>3. 배경지식: 커널과 메모리 취약점</span></h2>
<h3><span>3.1 Linux 커널이란?</span></h3>
<p><span>커널(Kernel)은 운영체제의 핵심 부분으로, 프로그램이 컴퓨터 자원을 사용할 수 있도록 관리한다.</span></p>
<p><span>예를 들어 프로그램이 메모리를 사용하거나 파일을 읽고 저장하려고 할 때, 커널이 필요한 작업을 처리한다.</span></p>
<p><span>일반 프로그램이 실행되는 공간을 사용자 영역(User Space), 커널이 실행되는 공간을 커널 영역(Kernel Space)이라고 한다.</span></p>
<p><span>이 두 영역은 권한이 다르다. 일반 프로그램은 시스템의 모든 자원에 마음대로 접근할 수 없지만, 커널은 운영체제 전체를 관리하기 위해 높은 권한을 가진다.</span></p>
<p><span>따라서 커널에 취약점이 존재하면 공격자가 일반 프로그램의 권한 제한을 벗어날 가능성이 생긴다.</span></p>
<p><span>이러한 공격 중 권한을 더 높은 수준으로 끌어올리는 것을 권한 상승(Privilege Escalation)이라고 한다.</span></p>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/user-kernel-space.png" | relative_url }}" alt="사용자 영역과 커널 영역의 차이"></figure>
<h3><span>3.2 Heap 메모리와 UAF</span></h3>
<p>Heap(힙)은 프로그램이 실행되는 중에 필요한 만큼 확보해 쓰는 메모리 공간이다. 창고에서 빈칸을 빌렸다가 반납하는 방식으로 생각하면 쉽다. 객체(Object)는 이런 공간에 들어가는 데이터 한 덩어리다. UAF(Use-After-Free)는 사용이 끝나 반환한 메모리를 예전 주소로 다시 접근하는 오류다. 예를 들어 A 가 쓰 던 칸을 비워 B 가 사용 중인데, 프로그램이 A 의 옛 주소를 계속 사용하면 B 가 뜻하지 않게 변경될 수 있다. 이 러한 오류가 실제 공격에 이용되려면 추가 조건이 필요하므로, UAF 가 있다는 사실만으로 곧바로 시스템 장악 이 가능하다는 뜻은 아니다.</p>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/use-after-free.png" | relative_url }}" alt="해제된 메모리의 참조가 남는 과정"></figure>
<h3><span>3.3 Slab, KFENCE, KASAN, MTE </span></h3>
<p><b> Slab Allocator</b>는 커널의 작은 객체들을 효율적으로 배치하는 메모리 할당기다. 여러 종류의 물건을 서로 다 른 서랍에 보관하듯 객체를 크기나 유형에 따라 나눠서 관리할 수 있다. 이를 객체 분리(Heap Segregation) 라고 하며, 일부 메모리 재사용 공격을 어렵게 만든다.</p>
<p><b>KFENCE(Kernel Electric Fence)</b>는 일부 메모리 할당을 뽑아 특별한 영역에서 검사하는 저부하 메모리 오류 탐지 기능이다. 모든 메모리를 검사하지 않고 일부를 선택하는 방식을 샘플링(Sampling)이라고 한다.</p>
<p>KFENCE는 보호 페이지(Guard Page)와 검사값(Poison Pattern) 등을 이용해 UAF 나 범위 초과 접근을 감 지할 수 있다. KASAN(Kernel Address Sanitizer)은 잘못된 메모리 접근을 검출하는 또 다른 기술이다.</p>
<p><b>MTE(Memory Tagging Extension)</b>는 ARM 하드웨어에서 메모리와 포인터에 표식을 부여해 접근이 맞는지 검사하는 기술 이다. 둘 다 메모리 오류를 발견하는 데 도움을 주지만, KFENCE 가 따로 관리하는 메모리에는 동일한 방식으 로 적용되지 않은 부분이 있었다.</p>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/kfence-guard-pages.png" | relative_url }}" alt="KFENCE의 보호 페이지와 객체 페이지"></figure>
<p>KFENCE 는 원래 &ldquo;오류를 찾는 도구&rdquo;이지 모든 공격을 완전히 차단하는 보안벽으로 설계된 것 은 아니다. 논문은 이 도구의 특별한 메모리 할당 경로가 다른 보호 기능과 충돌하는지 분석한다.</p>
<h2><span>4. 기존 방식의 문제점</span></h2>
<p>기존 Linux 커널은 중요한 객체를 다른 객체와 분리하거나 메모리에 식별표를 붙이는 등 공격을 어렵게 만드 는 기능을 발전시켜 왔다. 그런데 저자들은 &ldquo;보호 기능이 일반 Slab 경로에는 적용되지만 KFENCE 경로에서 도 똑같이 적용될까?&rdquo;라는 질문을 던졌다. 논문의 답은 그렇지 않다였다. KFENCE 는 메모리 오류 검사를 위한 고유한 풀(Pool)을 사용한다. 풀은 여러 객체를 저장하기 위해 미리 마련해 놓은 메모리 공간이다. 이 경로에서는 일반 Slab 이 제공하는 유형&middot;크기별 객체 분리가 일관되게 적용되지 않으며, KASAN 이나 MTE 의 검사도 동일하게 적용되지 않는 경우가 있었다. 따라서 문제의 핵심은 &ldquo;KFENCE 때문에 UAF 버그가 새로 생겼다&rdquo;가 아니다. 기존 UAF 취약점이 있을 때 KFENCE 의 별도 할당 경로를 이용하면, 원래는 서로 다른 영역에 있어야 할 객체가 같은 메모리 자리를 재사 용할 수 있다는 것이다.</p>
<h2><span>5. Fence2Pwn의 핵심 아이디어</span></h2>
<p>논문은 KFENCE 동작을 분석해 다섯 가지 특성을 W1 부터 W5 까지 정리했다. 모두가 구현 실수라는 뜻은 아 니다. 낮은 성능 부담과 오류 탐지라는 목적을 위해 선택된 설계가 공격 관점에서는 약점이 될 수도 있다는 의미다.</p>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/kfence-five-weaknesses.png" | relative_url }}" alt="논문에서 정리한 KFENCE의 다섯 가지 약점"></figure>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/kfence-design-limitations.png" | relative_url }}" alt="KFENCE 설계의 다섯 가지 한계"></figure>
<h2>6. 보호 정책의 적용 범위</h2><p>별도 할당 경로에서 객체 분리와 메모리 태그 검사가 달라지면 같은 메모리 오류도 환경에 따라 영향이 달라질 수 있다. 방어 기능을 평가할 때는 일반 할당과 표본 할당에 적용되는 보호 정책을 함께 확인해야 한다.</p>
<h2><span>7. 실험 환경 및 평가 결과</span></h2>
<p>연구진은 여러 Linux 커널 버전, QEMU/KVM 가상머신, Fedora 43 노트북, Android 16이 설치된 Pixel 8a에서 동작을 조사했다. 대표 실험에서는 커널 모듈로 UAF를 모사했고, 조건별로 독립적인 가상머신 100개를 사용했다.</p>
<h3><span>7.1 객체 중첩 성공률</span></h3>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/overlap-success-rates.png" | relative_url }}" alt="Linux 커널 버전별 객체 중첩 성공률"></figure>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/overlap-success-rate-table.png" | relative_url }}" alt="실험 조건별 객체 중첩 성공률 표"></figure>
<p><span> 논문에서 보고한 90%는 실험용 UAF 취약점과 특정 객체 배치 조건에서의 결과다. &ldquo;Linux 시 스템을 90% 확률로 해킹한다&rdquo;는 뜻이 아니다. 수치의 의미를 정확히 구분하는 것이 중요하다. </span></p>
<h3><span>7.2 실제 기기와 부하 환경 </span></h3>
<p>Pixel 8a / Android 16 실험에서는 KFENCE 를 거친 객체에 일반 Slab 객체처럼 MTE 의 무작위 태그 보호 가 적용되지 않는 점을 확인했다. 저자들은 또한 작업 부하가 높은 환경도 조사했다. 예를 들어 NGINX 부하 실 험에서는 검사한 8 개 UAF 객체 중 KFENCE 가 할당한 객체가 없었다. 이는 공격의 결과가 주변 프로그램의 활동과 메모리 상태에 영향을 받는다는 증거다.</p>
<h3>7.3 실제 취약점 사례</h3>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/cve-evaluation-scope.png" | relative_url }}" alt="실제 취약점 사례에서 논문이 검증한 결과의 범위"></figure>
<p>중요한 것은 이 실제 CVE 사례에서 저자들이 완전한 권한 상승까지 성공했다고 주장하지 않았다는 점이다. 실 제 취약점에서 객체 중첩과 메타데이터 변조를 보여준 것만으로도 연구의 의미가 있지만, 최종 시스템 장악을 입증한 것과는 다르게 써야 한다.</p>
<h2><span>8. 이 연구가 남긴 성과와 한계 </span></h2>
<p>이 논문의 성과는 새로운 UAF 버그 하나를 발견한 데 있지 않다. 보안을 위한 별도 메모리 할당 경로가 기존 방 어 기술의 사각지대가 될 수 있음을 체계적으로 보여줬다는 점이다. 이런 관점은 다른 시스템을 살펴볼 때에도 도움이 된다. 연구진은 발견 내용을 2025 년 12 월 Linux 커널 보안팀과 Google 에 보고했다. 논문에는 메모리 태깅 사용 시 KFENCE 를 비활성화하는 변경, 오류 대응 옵션, KFENCE 빈 슬롯 순서 무작위화 등 완화 조치가 관련 코드에 반영되었다고 기록되어 있다. 다만 객체 분리의 근본 문제를 완전히 해결하는 장기 대책은 여전히 쉽지 않다고 설명한다.</p>
<h2><span>9. 아쉬운 점</span></h2>
<figure><img src="{{ "/assets/img/posts/fence2pwn-kfence-review/research-limitations.png" | relative_url }}" alt="연구의 한계와 추가 검증 항목"></figure>
<p>특히 각 Slab 캐시마다 KFENCE 풀을 따로 만든다면 객체 분리를 강화할 수 있겠지만, 논문에서는 특정 Fedora 설정을 기준으로 1GiB 이상의 메모리가 추가로 필요할 수 있다고 계산한다. 보안성만 강화할 것이 아 니라 성능과 자원 사용량도 같이 생각해야 한다</p>
<h2><span>10. 논문을 읽고 느낀 점</span></h2>
<p><span>처음에는 보안 기능이라면 무조건 시스템을 더 안전하게 만들어 줄 것이라고 생각했다.</span></p>
<p><span>하지만 이번 논문을 통해 보안 기능도 하나의 프로그램이자 시스템 구성 요소라는 사실을 다시 생각하게 되었다.</span></p>
<p><span>KFENCE는 원래 메모리 오류를 발견하기 위해 설계되었다. 성능 부담을 줄이면서 실제 운영 환경에서 오류를 탐지하려는 목적도 있다.</span></p>
<p><span>그런데 이러한 설계 방식이 기존 메모리 보호 기술과 결합되면서 예상하지 못한 공격 경로를 만들어 낸 것이다.</span></p>
<p><span>가장 인상 깊었던 것은 연구진이 새로운 메모리 취약점 하나를 찾아내는 데 그치지 않았다는 점이다.</span></p>
<p><span>이미 존재하는 보안 기술을 분석하고, 서로 다른 기술이 함께 동작하는 과정에서 보호가 누락되는 부분을 찾아냈다.</span></p>
<p><span>이 부분을 보면서 시스템 해킹 연구에서는 취약한 코드 자체를 찾는 것도 중요하지만, 시스템 전체의 동작 방식을 이해하는 것이 그만큼 중요하다는 생각이 들었다.</span></p>
<p><span>또 하나 배운 점은 보안 기능의 목적과 실제 보안 효과를 구분해야 한다는 것이다.</span></p>
<p><span>KFENCE가 메모리 오류를 탐지하도록 설계되었다고 해서 모든 메모리 공격을 막는 것은 아니다.</span></p>
<p><span>그리고 KFENCE에서 발견된 문제가 있다고 해서 KFENCE가 아무런 가치가 없는 기능이라는 뜻도 아니다.</span></p>
<p><span>이번 연구는 오류 탐지와 공격 방어가 서로 다른 목적을 가지고 있으며, 두 기능 사이의 균형을 고려해야 한다는 사실을 보여준다.</span></p>
<p><span>개인적으로는 이러한 관점이 앞으로 시스템 보안을 공부할 때 도움이 될 것 같다.</span></p>
<p><span>이전에는 취약점이 발생한 코드나 공격 기법에만 집중해서 공부하려고 했다면, 앞으로는 해당 취약점을 막기 위해 어떤 방어 기술이 사용되는지, 그리고 그 방어 기술이 어떤 상황에서 정상적으로 작동하지 않을 수 있는지도 함께 살펴보고 싶다.</span></p>
<h2><span>11. 앞으로의 학습 및 연구 계획</span></h2>
<p><span>이번 과제를 마무리하면서 Fence2Pwn을 이해하는 데서 끝내지 않고, 관련 내용을 직접 공부하고 비교해 보고 싶다.</span></p>
<h3><span>11.1 추가로 읽어보고 싶은 논문</span></h3>
<p><span>먼저 USENIX Security 2025에 발표된 </span><span>When Good Kernel Defenses Go Bad: Reliable and Stable Kernel Exploits via Defense-Amplified TLB Side-Channel Leaks</span><span>를 읽어볼 계획이다.</span></p>
<p><span>이 논문은 커널 보호 기술이 의도치 않은 사이드채널 정보 유출을 발생시킬 수 있다는 문제를 다룬다.</span></p>
<p><span>Fence2Pwn과 공격 방식은 다른거 같지만 보안을 강화하기 위해 도입된 기능이 예상하지 못한 공격에 이용될 수 있다는 공통점이 있다.</span></p>
<p><span>다음으로 NDSS 2026의 </span><span>SoK: Take a Deep Step into Linux Kernel Hardening Effectiveness from the Offensive-Defensive Perspective</span><span>도 읽어보고 싶다.</span></p>
<p><span>SoK(Systematization of Knowledge)는 기존 연구와 지식을 체계적으로 정리하는 논문 유형이다.</span></p>
<p><span>이 논문은 여러 Linux 커널 방어 기법의 효과와 한계를 폭넓게 분석한다.</span></p>
<p><span>Fence2Pwn이 특정 메모리 보호 기능의 문제를 깊이 분석했다면, 해당 SoK 논문은 다양한 커널 방어 기술을 전체적인 관점에서 이해하는 데 도움이 될 것 같다.</span></p>
<h3><span>11.2 직접 구현하거나 재현해 보고 싶은 부분</span></h3>
<p><span>가장 먼저 해보고 싶은 것은 Linux 가상머신에서 KFENCE의 동작을 관찰하는 것이다.</span></p>
<p><span>QEMU와 Linux 테스트 환경을 구성한 뒤 KFENCE를 활성화했을 때와 비활성화했을 때의 차이를 비교해 보고 싶다.</span></p>
<p><span>특히 메모리 오류가 발생했을 때 어떤 로그가 출력되는지, 오류를 탐지하는 방식과 시스템 성능에 어떤 차이가 생기는지 알아보고 싶다.</span></p>
<p><span>이후 커널 메모리 관리에 대한 이해가 충분해지면, 연구진이 공개한 자료와 논문 속 실험 방법을 살펴보면서 객체 분리와 메모리 태그 보호가 적용되는 방식을 비교해 볼 계획이다.</span></p>
<p><span>실험은 외부 시스템이 아닌 격리된 가상머신에서 진행하고, 공격 성공 자체보다는 메모리 보호 기능이 어떤 조건에서 달라지는지 확인하는 데 초점을 맞추고 싶다.</span></p>
<h3><span>11.3 다른 분야에도 적용할 수 있을까?</span></h3>
<p><span>이번 연구의 문제의식은 Linux 커널 외의 다른 시스템에도 적용할 수 있다고 생각한다.</span></p>
<p><span>예를 들어 가상머신을 관리하는 하이퍼바이저(Hypervisor)나, 프로그램의 메모리 오류를 찾아내는 디버깅 도구에서도 일반적인 실행 경로와 특별한 검사 경로가 존재할 수 있다.</span></p>
<p><span>하이퍼바이저는 여러 가상머신이 하나의 컴퓨터에서 실행되도록 관리하는 기술이다.</span></p>
<p><span>이런 시스템에서도 보안 기능이 특정 경로에만 적용된다면 예상하지 못한 문제가 발생할 가능성이 있다.</span></p>
<p><span>물론 실제로 동일한 문제가 존재하는지는 별도로 검증해야 한다.</span></p>
<p><span>하지만 시스템의 일반적인 동작 경로와 특별한 처리 경로를 비교한다는 연구 방법은 다른 분야에도 활용할 수 있을 것 같다.</span></p>
<h3><span>11.4 연구 프로젝트로 발전시킨다면</span></h3>
<p><span>앞으로 이 내용을 연구 프로젝트로 발전시킨다면 </span><b><span>KFENCE 보안 패치 적용 전후의 메모리 보호 기능을 비교하는 연구</span></b><span>를 진행해 보고 싶다.</span></p>
<p><span>구체적으로는 KFENCE의 메모리 관리 방식이 변경되었을 때 다음과 같은 부분을 비교하고 싶다.</span></p>
<ul>
<li><span>메모리 오류 탐지 기능에 차이가 발생하는지</span></li>
<li><span>객체 분리 및 메모리 보호 수준이 어떻게 달라지는지</span></li>
<li><span>보안 패치로 인해 메모리 사용량이나 성능 부담이 증가하는지</span></li>
<li><span>기존 KFENCE의 낮은 성능 부담과 보안성을 함께 유지할 방법이 있는지</span></li>
</ul>
<p><span>처음부터 새로운 공격 기법을 만들어내는 것은 어렵겠지만, 기존 연구의 결과를 이해하고 방어 기능을 비교하는 것부터 시작한다면 충분히 의미 있는 학습이 될 것 같다.</span></p>
<p><span>이후에는 커널 메모리 할당기와 UAF 분석을 더 공부하고, 퍼징(Fuzzing)에도 관심을 넓히고 싶다.</span></p>
<p><span>퍼징은 프로그램에 다양한 입력을 자동으로 전달하여 비정상 동작이나 취약점을 찾아내는 테스트 방법이다.</span></p>
<p><span>최종적으로는 취약점을 자동으로 탐지하고, 발견한 문제가 기존 보안 기능에 의해 얼마나 효과적으로 차단되는지 분석할 수 있는 시스템을 만들어 보고 싶다.</span></p>
<h2><span>12. 결론</span></h2>
<p>Fence2Pwn 은 메모리 오류를 탐지하기 위한 KFENCE 가 일반 Slab 과 다른 할당 경로를 제공하며, 이 과정 에서 기존의 객체 분리와 메모리 태그 보호가 일관되게 적용되지 않는다는 사실을 보인 연구다. 저자들은 이 차이를 이용하여 기존 UAF 취약점에서 서로 다른 종류의 객체가 같은 메모리를 재사용하도록 만드는 기법을 제시했다.</p>
<p>나는 이 연구를 통해 보안 기능이 있다는 사실보다 그 기능이 실제로 어디에 적용되고 어떻게 상호작용하는지 확인하는 일이 중요하다는 것을 배웠다. 이후에는 Linux 커널 메모리 구조를 더 공부하고, KFENCE 의 변경 사항을 비교하는 작은 실험부터 시작하고 싶다.</p>
<div><hr /></div>
<h2><span>참고문헌 및 자료</span></h2>
<p><b><span>[1] 리뷰 대상 논문</span></b></p>
<p><span>Ernesto Mart&iacute;nez Garc&iacute;a, Lukas Maar, Martin Unterguggenberger, and Stefan Mangard. </span><span>Fence2Pwn: KFENCE-Enabled Kernel Exploitation Bypassing Slab Hardening and Memory Tagging.</span><span> 35th USENIX Security Symposium, pp. 869&ndash;887, 2026.</span></p>
<p><b><span>[2] Linux KFENCE 공식 문서</span></b></p>
<p><span>Linux Kernel Documentation. </span><span>Kernel Electric-Fence (KFENCE).</span></p>
<ul>
<li><a href="https://docs.kernel.org/dev-tools/kfence.html"><span>Linux 커널 공식 문서</span></a></li>
</ul>
<p><b><span>[3] 추가로 읽을 논문 &mdash; 커널 방어 기법과 사이드채널</span></b></p>
<p><span>Lukas Maar, Lukas Giner, Daniel Gruss, and Stefan Mangard. </span><span>When Good Kernel Defenses Go Bad: Reliable and Stable Kernel Exploits via Defense-Amplified TLB Side-Channel Leaks.</span><span> USENIX Security 2025.</span></p>
<ul>
<li><a href="https://www.usenix.org/conference/usenixsecurity25/presentation/maar-kernel"><span>USENIX 공식 페이지</span></a></li>
</ul>
<p><b><span>[4] 추가로 읽을 논문 &mdash; 커널 보안 기법 종합 분석</span></b></p>
<p><span>Yinhao Hu 외. </span><span>SoK: Take a Deep Step into Linux Kernel Hardening Effectiveness from the Offensive-Defensive Perspective.</span><span> NDSS 2026.</span></p>
<ul>
<li><a href="https://www.ndss-symposium.org/ndss-paper/sok-take-a-deep-step-into-linux-kernel-hardening-effectiveness-from-the-offensive-defensive-perspective/"><span>NDSS 공식 논문 페이지</span></a></li>
</ul>
