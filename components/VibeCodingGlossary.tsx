import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, X, Copy, Check, ExternalLink, 
  Maximize, Globe, Sparkles, Cpu, ArrowRight,
  Menu, MousePointer2, ArrowUp, Image as ImageIcon, Bell,
  LayoutTemplate, Compass, Keyboard, Activity, Palette, Zap,
  Database, Server, Wrench, Code2, Workflow, Link as LinkIcon,
  Volume2, VolumeX, Play, FileJson, Layers, Box, Terminal,
  Share2, Lock, Smartphone, Globe2, GitBranch, Bug, FileText
} from 'lucide-react';

// --- TypeScript Interfaces ---
interface Term {
  id: number;
  category: string;
  termKr: string;
  termEn: string;
  summary: string;
  detail: string;
  promptKr: string;
  promptEn: string;
  related: number[];
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  color: string;
  duration: string;
  delay: string;
  blur: string;
}

// --- 다국어 UI 텍스트 ---
const UI_TEXT: Record<string, any> = {
  ko: {
    title: "바이브코딩 용어 사전",
    subtitle: "made by 뭉슈쌤",
    searchPlaceholder: "용어 검색 (예: API, 훅, 컴포넌트...)",
    total: "총",
    countUnit: "개",
    all: "전체",
    modal: {
      summary: "핵심 요약",
      detail: "상세 설명",
      promptKr: "한국어 프롬프트",
      promptEn: "영어 프롬프트",
      related: "관련 용어",
    },
    intro: {
      welcome: "개발자의 언어를\n감각적으로 익히다",
      desc: "디자인, 개발, AI가 만나는 곳.\n가장 트렌디한 용어들을 시각적으로 경험해보세요.",
      button: "바이브코딩 용어사전 살펴보기"
    }
  },
  en: {
    title: "VibeCoding Glossary",
    subtitle: "made by moonsulee",
    searchPlaceholder: "Search terms...",
    total: "Total",
    countUnit: "items",
    all: "All",
    modal: {
      summary: "Summary",
      detail: "Detail Description",
      promptKr: "Korean Prompt",
      promptEn: "English Prompt",
      related: "Related Terms",
    },
    intro: {
      welcome: "Master Developer\nLingo with Vibe",
      desc: "Where Design, Code, and AI meet.\nExperience trendy terms visually.",
      button: "Explore VibeCoding Glossary"
    }
  }
};

// --- 카테고리별 색상 매핑 ---
const CATEGORY_COLORS: Record<string, string> = {
  '구조/레이아웃': 'blue',
  '내비게이션': 'indigo',
  '입력/조작': 'rose',
  '정보/데이터': 'cyan',
  '상태/피드백': 'amber',
  '스타일/비주얼': 'fuchsia',
  '모션/인터랙션': 'purple',
  '고급/AI': 'violet',
  '데이터/통신': 'teal',
  '개발/개념': 'slate',
  '도구/라이브러리': 'sky',
  '배포/운영': 'emerald'
};

// --- 카테고리별 상세 설명 매핑 ---
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  '구조/레이아웃': '화면의 뼈대와 배치를 담당하는 용어들입니다.',
  '내비게이션': '사용자가 길을 잃지 않고 이동하게 돕는 용어들입니다.',
  '입력/조작': '사용자가 정보를 입력하거나 선택하는 도구들입니다.',
  '정보/데이터': '복잡한 데이터를 알기 쉽게 보여주는 시각화 용어들입니다.',
  '상태/피드백': '시스템의 상황을 사용자에게 알려주는 신호들입니다.',
  '스타일/비주얼': '앱의 분위기를 결정짓는 디자인 기법들입니다.',
  '모션/인터랙션': '움직임과 반응을 담당하는 용어들입니다.',
  '고급/AI': 'AI 기술이나 특수한 기능을 구현할 때 쓰는 용어들입니다.',
  '데이터/통신': '앱이 기억하고 대화하는 방법입니다.',
  '개발/개념': 'AI에게 코딩을 시킬 때 알아야 할 설계 용어입니다.',
  '도구/라이브러리': 'AI에게 "이 도구를 써서 만들어줘"라고 콕 집어 말할 때 씁니다.',
  '배포/운영': '앱을 세상에 내놓고 관리하는 마무리 단계입니다.'
};

// --- 카테고리 아이콘 매핑 ---
const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  '구조/레이아웃': <LayoutTemplate size={20} />,
  '내비게이션': <Compass size={20} />,
  '입력/조작': <Keyboard size={20} />,
  '정보/데이터': <Activity size={20} />,
  '상태/피드백': <Bell size={20} />,
  '스타일/비주얼': <Palette size={20} />,
  '모션/인터랙션': <Zap size={20} />,
  '고급/AI': <Cpu size={20} />,
  '데이터/통신': <Database size={20} />,
  '개발/개념': <Code2 size={20} />,
  '도구/라이브러리': <Wrench size={20} />,
  '배포/운영': <Server size={20} />
};

// --- 3D 파티클 배경 컴포넌트 ---
const ParticleBackground: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      size: Math.random() * 15 + 5 + 'px',
      color: [
        'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 
        'bg-yellow-400', 'bg-green-400', 'bg-cyan-400'
      ][Math.floor(Math.random() * 6)],
      duration: Math.random() * 10 + 10 + 's',
      delay: Math.random() * 5 + 's',
      blur: Math.random() > 0.5 ? 'blur-sm' : 'blur-md'
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 opacity-90"></div>
      {particles.map((p: Particle) => (
        <div
          key={p.id}
          className={`absolute rounded-full opacity-30 ${p.color} ${p.blur} animate-float`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

// --- 데이터: 200개 용어 전체 리스트 (Updated with Provided Text) ---
const TERMS_DATA: Term[] = [
  // 1. 구조 및 레이아웃 (Structure & Layout)
  { id: 1, category: '구조/레이아웃', termKr: '내비게이션 바', termEn: 'Navbar / GNB', summary: '상단 고정 메인 메뉴.', detail: '웹사이트 최상단에 고정되어 로고, 메뉴, 로그인 버튼 등을 포함하는 나침반 역할을 합니다. 사용자가 어디에 있든 항상 접근할 수 있어야 하며, 사이트의 전체 구조를 한눈에 파악하게 해줍니다.', promptKr: '상단에 로고와 주요 메뉴가 포함된 고정된 내비게이션 바를 만들어줘.', promptEn: 'Create a sticky Navbar at the top with a logo and menu items.', related: [2, 5] },
  { id: 2, category: '구조/레이아웃', termKr: '사이드바', termEn: 'Sidebar', summary: '측면 고정 보조 메뉴.', detail: '화면 좌측이나 우측에 세로로 길게 배치되어 보조 메뉴나 필터 옵션을 제공합니다. 정보가 많은 관리자 페이지나 대시보드 화면에서 공간 효율을 높이기 위해 자주 사용됩니다.', promptKr: '왼쪽에 접을 수 있는 사이드바 메뉴를 배치해줘.', promptEn: 'Place a collapsible Sidebar menu on the left.', related: [1, 14] },
  { id: 3, category: '구조/레이아웃', termKr: '히어로 섹션', termEn: 'Hero Section', summary: '첫 화면 대형 배너.', detail: '웹사이트 접속 시 가장 먼저 보이는 대문 역할을 하는 영역입니다. 시선을 사로잡는 고화질 이미지와 짧고 강렬한 문구, 그리고 행동을 유도하는 버튼(CTA)을 배치하여 첫인상을 결정짓습니다.', promptKr: '홈페이지 첫 화면에 인상적인 문구가 담긴 히어로 섹션을 디자인해줘.', promptEn: 'Design a Hero Section with impressive text for the homepage landing.', related: [100, 11] },
  { id: 4, category: '구조/레이아웃', termKr: '푸터', termEn: 'Footer', summary: '하단 정보 모음 영역.', detail: '페이지 맨 아래에 위치하며 저작권, 회사 주소, 이용 약관, SNS 링크 등을 담습니다. 사용자가 페이지 끝까지 스크롤 했을 때 마지막으로 정보를 확인하고 다른 곳으로 이동할 수 있게 돕습니다.', promptKr: 'SNS 아이콘과 연락처가 포함된 푸터를 하단에 추가해줘.', promptEn: 'Add a Footer at the bottom containing SNS icons and contact info.', related: [6] },
  { id: 5, category: '구조/레이아웃', termKr: '스티키 헤더', termEn: 'Sticky Header', summary: '스크롤 시 상단 부착 헤더.', detail: '스크롤을 내려도 화면 천장에 딱 붙어 사라지지 않는 헤더입니다. 긴 페이지를 읽는 도중에도 언제든지 메뉴를 이용하거나 홈으로 돌아갈 수 있어 편의성을 높여줍니다.', promptKr: '스크롤을 내려도 상단에 계속 보이도록 스티키 헤더를 적용해줘.', promptEn: 'Apply a Sticky Header so it remains visible while scrolling.', related: [1] },
  { id: 6, category: '구조/레이아웃', termKr: '스티키 푸터', termEn: 'Sticky Footer', summary: '항상 바닥에 붙는 푸터.', detail: '콘텐츠 내용이 짧아서 화면이 남을 때, 푸터가 중간에 붕 뜨지 않고 브라우저 맨 아래에 고정되도록 합니다. 시각적으로 안정감을 주며 디자인의 완성도를 높이는 기법입니다.', promptKr: '콘텐츠가 짧아도 저작권 정보가 맨 아래 붙어있게 스티키 푸터로 만들어줘.', promptEn: 'Make a Sticky Footer so the copyright info stays at the bottom even with short content.', related: [4] },
  { id: 7, category: '구조/레이아웃', termKr: '그리드', termEn: 'Grid', summary: '바둑판식 격자 배치.', detail: '화면을 가로(행)와 세로(열)로 나누어 콘텐츠를 규칙적으로 배치하는 시스템입니다. 신문이나 잡지처럼 정보를 질서 정연하게 보여주어 가독성을 높이는 데 가장 기초적인 레이아웃입니다.', promptKr: '이미지 갤러리를 3열 그리드 레이아웃으로 배치해줘.', promptEn: 'Arrange the image gallery in a 3-column Grid layout.', related: [10, 11] },
  { id: 8, category: '구조/레이아웃', termKr: '반응형 레이아웃', termEn: 'Responsive Layout', summary: '기기별 자동 맞춤 디자인.', detail: 'PC, 태블릿, 모바일 등 접속하는 기기의 화면 크기에 따라 레이아웃이 유동적으로 변합니다. 하나의 웹사이트로 모든 기기에 최적화된 경험을 제공하기 위해 필수적입니다.', promptKr: '모바일에서는 1열, PC에서는 4열로 보이는 반응형 레이아웃을 작성해줘.', promptEn: 'Write a Responsive Layout that shows 1 column on mobile and 4 columns on PC.', related: [7] },
  { id: 9, category: '구조/레이아웃', termKr: '컨테이너', termEn: 'Container', summary: '중앙 정렬 최대 너비 박스.', detail: '콘텐츠가 화면 양옆으로 무한히 퍼지는 것을 막고, 읽기 좋은 적당한 너비로 제한하여 중앙에 배치합니다. 큰 모니터에서 볼 때 글자가 너무 길어지는 것을 방지합니다.', promptKr: '모든 본문 내용이 중앙에 오도록 최대 너비가 설정된 컨테이너로 감싸줘.', promptEn: 'Wrap all body content in a Container with a max-width to center it.', related: [18] },
  { id: 10, category: '구조/레이아웃', termKr: '메이슨리 그리드', termEn: 'Masonry Grid', summary: '지그재그 벽돌 쌓기 배치.', detail: '핀터레스트처럼 높이가 제각각인 카드들을 빈틈없이 짜 맞추는 방식입니다. 정형화된 그리드보다 자유롭고 리듬감 있는 시각적 경험을 제공하여 이미지 갤러리에 적합합니다.', promptKr: '사진들의 높이가 달라도 빈틈없이 채워지는 메이슨리 그리드를 적용해줘.', promptEn: 'Apply a Masonry Grid so photos fill the gaps regardless of their height.', related: [7, 11] },
  { id: 11, category: '구조/레이아웃', termKr: '벤토 그리드', termEn: 'Bento Grid', summary: '도시락 통 모양 박스 배치.', detail: '애플의 홍보물처럼 다양한 크기의 직사각형 박스들을 오밀조밀하게 모아 정보를 보여줍니다. 각 박스가 독립적인 정보를 담으면서도 전체적으로 세련되고 정돈된 느낌을 줍니다.', promptKr: '정보 박스들을 벤토 그리드 레이아웃으로 깔끔하게 배치해줘.', promptEn: 'Arrange information boxes neatly using a Bento Grid layout.', related: [7, 16] },
  { id: 12, category: '구조/레이아웃', termKr: '테일윈드 CSS', termEn: 'Tailwind CSS', summary: '클래스 기반 초고속 스타일링.', detail: '별도의 CSS 파일을 만들지 않고 HTML 안에 클래스 이름만 적어서 디자인하는 도구입니다. 직관적이고 수정이 빨라 바이브코딩에서 가장 선호하는 스타일링 방식입니다.', promptKr: 'Tailwind CSS를 사용하여 전체적인 레이아웃을 모던하고 깔끔하게 잡아줘.', promptEn: 'Style the overall layout to be modern and clean using Tailwind CSS.', related: [13] },
  { id: 13, category: '구조/레이아웃', termKr: '섀드씨엔 유아이', termEn: 'Shadcn UI', summary: '복사형 트렌디 컴포넌트.', detail: '설치형 라이브러리가 아니라 코드를 복사해서 내 입맛대로 고쳐 쓰는 컴포넌트 모음입니다. 디자인이 매우 현대적이고 커스터마이징이 자유로워 최근 개발 트렌드를 주도하고 있습니다.', promptKr: '모든 UI 요소는 Shadcn UI 컴포넌트를 사용해서 깔끔하게 구축해줘.', promptEn: 'Build all UI elements using Shadcn UI components for a clean look.', related: [12] },
  { id: 14, category: '구조/레이아웃', termKr: '드로어/패널', termEn: 'Drawer', summary: '슬라이딩 서랍 메뉴.', detail: '평소에는 숨겨져 있다가 버튼을 누르면 화면 한쪽에서 부드럽게 밀려 나오는 패널입니다. 모바일에서 메뉴 공간을 확보하거나, 복잡한 설정 화면을 잠시 보여줄 때 유용합니다.', promptKr: '설정 버튼을 누르면 오른쪽에서 슬라이드 되어 나오는 드로어를 구현해줘.', promptEn: 'Implement a Drawer that slides in from the right when the settings button is clicked.', related: [2, 15] },
  { id: 15, category: '구조/레이아웃', termKr: '바텀 시트', termEn: 'Bottom Sheet', summary: '하단 슬라이딩 팝업.', detail: '모바일 화면 아래쪽에서 위로 올라오는 패널로, 한 손으로 조작하기 쉬운 위치에 뜹니다. 추가 정보를 보여주거나 간단한 선택지를 제공할 때 모달 대신 자주 사용됩니다.', promptKr: '모바일에서 상세 정보를 보여주는 바텀 시트를 추가해줘.', promptEn: 'Add a Bottom Sheet to display detailed information on mobile.', related: [14, 32] },
  { id: 16, category: '구조/레이아웃', termKr: '카드 레이아웃', termEn: 'Card Layout', summary: '박스형 정보 나열.', detail: '이미지, 제목, 내용을 하나의 사각형 박스(카드)에 묶어 독립된 정보 덩어리로 만듭니다. 섞이거나 흐트러지지 않아 사용자가 정보를 스캔하기 좋으며 모바일 친화적입니다.', promptKr: '블로그 게시글 목록을 카드 레이아웃 디자인으로 보여줘.', promptEn: 'Display the blog post list using a Card Layout design.', related: [11] },
  { id: 17, category: '구조/레이아웃', termKr: '구분선', termEn: 'Divider', summary: '콘텐츠 분리 선.', detail: '내용의 주제가 바뀌거나 구역을 나눌 때 사용하는 얇은 선입니다. 너무 강하지 않은 색상으로 은은하게 적용하여 시각적인 복잡함을 줄이고 정돈된 느낌을 줍니다.', promptKr: '각 섹션 사이에 얇은 회색 구분선을 넣어줘.', promptEn: 'Insert a thin gray Divider between each section.', related: [18] },
  { id: 18, category: '구조/레이아웃', termKr: '여백', termEn: 'Whitespace', summary: '요소 사이의 빈 공간.', detail: '디자인의 숨구멍 역할을 하여 시각적 피로를 줄이고 중요한 정보를 돋보이게 합니다. 여백이 충분해야 화면이 고급스러워 보이고 사용자가 정보를 읽기 편해집니다.', promptKr: '요소들 사이에 충분한 여백을 주어 답답하지 않게 해줘.', promptEn: 'Give enough Whitespace between elements to avoid a cluttered look.', related: [9] },
  { id: 19, category: '구조/레이아웃', termKr: 'Z-인덱스', termEn: 'Z-index', summary: '요소 쌓임 순서(층수).', detail: '여러 요소가 겹쳐 있을 때 무엇을 맨 위에 보여줄지 결정하는 값입니다. 팝업창이나 드롭다운 메뉴가 다른 글자에 가려지지 않고 항상 위에 뜨게 할 때 설정합니다.', promptKr: '이 팝업창이 항상 다른 요소보다 위에 뜨도록 Z-인덱스를 높게 설정해줘.', promptEn: 'Set a high Z-index for this popup so it always appears above other elements.', related: [82] },
  { id: 20, category: '구조/레이아웃', termKr: '세이프 에어리어', termEn: 'Safe Area', summary: '노치 회피 안전 여백.', detail: '최신 스마트폰의 노치(카메라 구멍)나 하단 바에 콘텐츠가 가려지지 않도록 확보하는 여백입니다. 모바일 웹 디자인 시 글자가 잘리는 것을 방지하기 위해 필수적으로 고려해야 합니다.', promptKr: '아이폰 노치에 콘텐츠가 가리지 않도록 세이프 에어리어 여백을 확보해줘.', promptEn: 'Ensure Safe Area padding so content is not obscured by the iPhone notch.', related: [8] },
  { id: 21, category: '구조/레이아웃', termKr: '플렉스박스', termEn: 'Flexbox', summary: '1차원 유연한 정렬.', detail: '요소들을 가로 한 줄이나 세로 한 줄로 배치하고, 간격을 균등하게 맞추는 데 최적화된 기술입니다. 버튼을 중앙에 놓거나, 메뉴들을 양 끝으로 벌릴 때 가장 많이 씁니다.', promptKr: '카드 안의 내용물들이 수직 중앙 정렬이 되도록 플렉스박스를 적용해줘.', promptEn: 'Apply Flexbox to vertically center the content inside the card.', related: [7] },
  { id: 22, category: '구조/레이아웃', termKr: '스플릿 뷰', termEn: 'Split View', summary: '좌우 분할 화면.', detail: '화면을 두 개 이상의 영역으로 나누어 서로 다른 정보를 동시에 보여줍니다. 사용자가 경계선을 드래그하여 각 영역의 크기를 조절할 수 있게 만들기도 합니다.', promptKr: '화면을 좌우로 나누고 너비를 조절할 수 있는 스플릿 뷰를 만들어줘.', promptEn: 'Create a resizable Split View dividing the screen left and right.', related: [7] },
  { id: 23, category: '구조/레이아웃', termKr: '뷰포트', termEn: 'Viewport', summary: '현재 보이는 화면 영역.', detail: '사용자가 보고 있는 브라우저의 실제 창 크기를 말합니다. \'뷰포트의 100%\'로 설정하면 스크롤 없이 딱 한 화면에 꽉 차게 디자인할 수 있습니다.', promptKr: '첫 섹션이 뷰포트 높이(100vh)를 꽉 채우도록 설정해줘.', promptEn: 'Set the first section to fill the full Viewport height (100vh).', related: [20] },
  { id: 24, category: '구조/레이아웃', termKr: '거터', termEn: 'Gutter', summary: '그리드 사이 간격.', detail: '단(Column)과 단 사이, 또는 카드와 카드 사이의 골목길 같은 여백입니다. 거터가 없으면 내용이 뭉쳐 보이므로 적절한 간격을 주어 가독성을 확보해야 합니다.', promptKr: '카드 사이에 답답하지 않게 20px 정도의 거터(간격)를 줘.', promptEn: 'Give a 20px Gutter between cards to avoid clutter.', related: [18] },
  { id: 25, category: '구조/레이아웃', termKr: '오버레이', termEn: 'Overlay', summary: '덮어씌우는 반투명 층.', detail: '이미지 위에 글자를 쓸 때 잘 보이게 하려고 어두운 막을 씌우거나, 팝업이 뜰 때 배경을 흐리게 덮는 층입니다. 사용자의 시선을 원하는 곳으로 집중시키는 효과가 있습니다.', promptKr: '텍스트가 잘 보이게 이미지 위에 검은색 반투명 오버레이를 씌워줘.', promptEn: 'Put a semi-transparent black Overlay on the image to make text readable.', related: [118] },
  { id: 26, category: '구조/레이아웃', termKr: '브레이크포인트', termEn: 'Breakpoint', summary: '반응형 디자인 변경 기준점.', detail: '화면 너비가 몇 픽셀일 때 모바일 디자인으로 바꿀지 정하는 기준선입니다. 보통 태블릿(768px), 모바일(480px) 등을 기준으로 레이아웃을 다르게 보여줍니다.', promptKr: '모바일 브레이크포인트를 768px로 잡고 디자인을 변경해줘.', promptEn: 'Set the mobile Breakpoint at 768px and change the design there.', related: [8] },

  // 2. 내비게이션 (Navigation)
  { id: 27, category: '내비게이션', termKr: '햄버거 메뉴', termEn: 'Hamburger Menu', summary: '모바일용 접이식 메뉴 아이콘.', detail: '좁은 화면에서 공간을 아끼기 위해 메뉴를 숨겨두었다가, 삼선(≡) 아이콘을 누르면 펼쳐지는 방식입니다. 모바일 웹의 표준적인 내비게이션 방식입니다.', promptKr: '모바일 화면에서는 내비게이션 바를 햄버거 메뉴로 변경해줘.', promptEn: 'Change the navbar to a Hamburger Menu on mobile screens.', related: [1] },
  { id: 28, category: '내비게이션', termKr: '탭 바', termEn: 'Tab Bar', summary: '화면 전환 탭 버튼.', detail: '폴더의 견출지처럼 상단이나 하단에 버튼을 두어, 누르는 즉시 페이지 내용만 싹 바뀌게 합니다. 관련된 여러 카테고리를 빠르게 오갈 때 유용합니다.', promptKr: '상단에 \'공지사항\'과 \'이벤트\'를 오가는 탭 바를 만들어줘.', promptEn: 'Create a Tab Bar at the top to switch between \'Notices\' and \'Events\'.', related: [1] },
  { id: 29, category: '내비게이션', termKr: '브레드크럼', termEn: 'Breadcrumb', summary: '경로 표시 내비게이션.', detail: '\'홈 > 옷 > 바지\' 처럼 현재 페이지가 어디에 속해있는지 경로를 텍스트로 보여줍니다. 사용자가 상위 카테고리로 쉽게 돌아갈 수 있게 도와주는 길잡이입니다.', promptKr: '사용자가 현재 위치를 알 수 있게 페이지 상단에 브레드크럼을 추가해줘.', promptEn: 'Add Breadcrumbs at the top of the page so users know their current location.', related: [1] },
  { id: 30, category: '내비게이션', termKr: '페이지네이션', termEn: 'Pagination', summary: '페이지 번호 이동.', detail: '게시글이 많을 때 한 화면에 다 보여주지 않고 1, 2, 3 페이지로 나누어 보여줍니다. 사용자가 원하는 페이지로 건너뛸 수 있어 탐색에 유리합니다.', promptKr: '게시판 하단에 이전/다음 버튼이 있는 페이지네이션을 구현해줘.', promptEn: 'Implement Pagination with prev/next buttons at the bottom of the board.', related: [25] },
  { id: 31, category: '내비게이션', termKr: '무한 스크롤', termEn: 'Infinite Scroll', summary: '스크롤 시 자동 로딩.', detail: '페이스북이나 인스타그램처럼 바닥에 닿으면 자동으로 새로운 글을 불러옵니다. 사용자가 끊김 없이 계속 콘텐츠를 소비하게 만들고 싶을 때 적합합니다.', promptKr: '상품 목록을 다 내리면 자동으로 다음 목록을 불러오는 무한 스크롤을 적용해줘.', promptEn: 'Apply Infinite Scroll to automatically load the next items when scrolling down the product list.', related: [24] },
  { id: 32, category: '내비게이션', termKr: '단계 진행/마법사', termEn: 'Stepper', summary: '단계별 진행 표시.', detail: '회원가입이나 결제처럼 긴 과정을 \'1단계→2단계→완료\'로 나누어 보여줍니다. 사용자가 현재 어디까지 왔고 얼마나 남았는지 시각적으로 알려주어 이탈을 막습니다.', promptKr: '회원가입 과정을 3단계로 보여주는 스텝퍼 UI를 만들어줘.', promptEn: 'Create a Stepper UI showing the 3 stages of the sign-up process.', related: [92] },
  { id: 33, category: '내비게이션', termKr: '키보드 내비게이션', termEn: 'Keyboard Navigation', summary: '키보드 조작 지원.', detail: '마우스 없이 탭(Tab) 키와 화살표 키만으로 메뉴를 이동하고 선택할 수 있게 합니다. 숙련된 사용자나 신체적 제약이 있는 사용자를 위한 필수 접근성 기능입니다.', promptKr: '마우스 없이 탭(Tab) 키로만 모든 메뉴를 이동할 수 있게 키보드 내비게이션을 지원해줘.', promptEn: 'Support Keyboard Navigation so all menus are accessible using just the Tab key.', related: [128] },
  { id: 34, category: '내비게이션', termKr: '모션 기반 내비게이션', termEn: 'Motion Nav', summary: '애니메이션 화면 전환.', detail: '페이지가 바뀔 때 단순히 깜빡거리는 게 아니라, 슬라이드 되거나 부드럽게 떠오르는 효과를 줍니다. 앱의 흐름이 끊기지 않고 자연스럽게 연결된 느낌을 줍니다.', promptKr: '페이지가 바뀔 때 부드럽게 슬라이드 되는 모션 기반 내비게이션을 넣어줘.', promptEn: 'Insert Motion-based Navigation that slides smoothly when pages change.', related: [109] },
  { id: 35, category: '내비게이션', termKr: '스크롤 스파이', termEn: 'Scroll Spy', summary: '스크롤 위치 감지 메뉴.', detail: '긴 문서를 읽을 때, 현재 보고 있는 섹션에 해당하는 목차 버튼에 자동으로 불이 들어옵니다. 사용자가 전체 글 중 어디를 읽고 있는지 파악하기 좋습니다.', promptKr: '본문을 스크롤 할 때 해당 목차가 하이라이트 되는 스크롤 스파이 기능을 넣어줘.', promptEn: 'Add a Scroll Spy feature that highlights the table of contents as the body is scrolled.', related: [23] },
  { id: 36, category: '내비게이션', termKr: '메가 메뉴', termEn: 'Mega Menu', summary: '대형 펼침 메뉴.', detail: '쇼핑몰처럼 메뉴에 마우스를 올렸을 때 하위 카테고리들이 큰 판 형태로 한꺼번에 펼쳐집니다. 복잡한 구조의 사이트에서 많은 메뉴를 한눈에 보여줄 때 효과적입니다.', promptKr: '메뉴에 마우스를 올리면 하위 카테고리가 모두 보이는 메가 메뉴를 만들어줘.', promptEn: 'Create a Mega Menu that shows all sub-categories when hovering over the menu.', related: [1] },
  { id: 37, category: '내비게이션', termKr: '백 투 탑 버튼', termEn: 'Back to Top', summary: '최상단 이동 버튼.', detail: '스크롤을 많이 내렸을 때 화면 구석에 나타나는 화살표 버튼입니다. 클릭 한 번으로 페이지 맨 위로 빠르게 되돌아갈 수 있어 편리합니다.', promptKr: '스크롤을 내리면 우측 하단에 \'맨 위로\' 가는 백 투 탑 버튼이 나타나게 해줘.', promptEn: 'Make a Back to Top button appear at the bottom right when scrolling down.', related: [5] },
  { id: 38, category: '내비게이션', termKr: '액션 시트', termEn: 'Action Sheet', summary: '하단 선택 메뉴.', detail: '주로 모바일에서 점 3개 버튼 등을 눌렀을 때 밑에서 올라오는 메뉴입니다. \'삭제\', \'수정\', \'공유\'처럼 현재 상황에서 할 수 있는 행동들을 나열해 줍니다.', promptKr: '공유하기 버튼을 누르면 하단에서 올라오는 액션 시트 메뉴를 보여줘.', promptEn: 'Show an Action Sheet menu sliding up from the bottom when \'Share\' is pressed.', related: [15] },
  { id: 39, category: '내비게이션', termKr: '앵커 링크', termEn: 'Anchor Link', summary: '페이지 내 점프 링크.', detail: '클릭하면 같은 페이지의 특정 위치로 스크롤 되어 이동합니다. 긴 랜딩 페이지에서 \'가격 보기\' 버튼을 누르면 아래쪽 가격표 섹션으로 바로 이동할 때 씁니다.', promptKr: '메뉴를 누르면 해당 섹션으로 스크롤 이동하는 앵커 링크를 걸어줘.', promptEn: 'Set up Anchor Links so clicking the menu scrolls to that section.', related: [1] },
  { id: 40, category: '내비게이션', termKr: '퀵 메뉴 / 스피드 다이얼', termEn: 'Quick Menu', summary: '단축 실행 메뉴.', detail: '화면 구석의 버튼을 누르면 부채꼴이나 리스트 형태로 주요 기능들이 펼쳐집니다. \'글쓰기\', \'문의하기\' 등 자주 쓰는 기능을 한곳에 모아 빠르게 접근하게 합니다.', promptKr: '우측 하단에 전화 걸기, 상담하기가 나오는 퀵 메뉴를 만들어줘.', promptEn: 'Create a Quick Menu at the bottom right showing call and chat options.', related: [52] },
  { id: 41, category: '내비게이션', termKr: '오프 캔버스', termEn: 'Off-canvas', summary: '화면 밖 숨김 메뉴.', detail: '평소에는 화면 밖(Off) 영역에 숨어 있다가, 호출하면 화면 안으로 들어오는 메뉴입니다. 드로어와 비슷하지만 주로 필터나 장바구니처럼 보조 기능을 담을 때 씁니다.', promptKr: '필터 버튼을 누르면 왼쪽 화면 밖에서 나오는 오프 캔버스 메뉴를 구현해줘.', promptEn: 'Implement an Off-canvas menu that slides in from the left when filtering.', related: [14] },
  { id: 42, category: '내비게이션', termKr: '스킵 내비게이션', termEn: 'Skip Navigation', summary: '본문 바로가기 링크.', detail: '키보드 사용자나 스크린 리더 사용자가 반복되는 메뉴를 건너뛰고 바로 본문으로 갈 수 있게 해주는 숨겨진 링크입니다. 웹 접근성을 준수하기 위해 반드시 넣어야 합니다.', promptKr: '웹 접근성을 준수하기 위해 본문으로 바로 가는 스킵 내비게이션을 추가해줘.', promptEn: 'Add Skip Navigation to jump straight to content for accessibility compliance.', related: [33] },

  // 3. 입력 및 조작 (Input & Control)
  { id: 43, category: '입력/조작', termKr: '플레이스홀더', termEn: 'Placeholder', summary: '입력창 안내 문구.', detail: '입력창이 비어있을 때 \'이메일을 입력하세요\'처럼 흐리게 보여주는 예시 글자입니다. 사용자가 무엇을 적어야 할지 힌트를 주며, 입력을 시작하면 사라집니다.', promptKr: '입력창 안에 \'이메일을 입력하세요\'라는 플레이스홀더를 넣어줘.', promptEn: 'Put a Placeholder inside the input field saying \'Enter your email\'.', related: [34] },
  { id: 44, category: '입력/조작', termKr: '레이블', termEn: 'Label', summary: '입력 항목 이름표.', detail: '입력창 바깥에 붙어있는 \'아이디\', \'비밀번호\' 같은 제목입니다. 입력창 안에 있는 플레이스홀더와 달리, 입력을 시작해도 사라지지 않아 사용자가 어떤 칸인지 계속 알 수 있습니다.', promptKr: '모든 입력 필드 위에 명확한 레이블을 달아줘.', promptEn: 'Attach clear Labels above all input fields.', related: [35] },
  { id: 45, category: '입력/조작', termKr: '플로팅 레이블', termEn: 'Floating Label', summary: '움직이는 이름표.', detail: '처음엔 플레이스홀더처럼 안에 있다가, 클릭하면 위로 작게 이동하여 레이블이 되는 애니메이션 효과입니다. 공간을 절약하면서도 세련된 느낌을 줍니다.', promptKr: '입력창을 클릭하면 레이블이 위로 작게 이동하는 플로팅 레이블 효과를 줘.', promptEn: 'Give it a Floating Label effect where the label moves up small when the input is clicked.', related: [34] },
  { id: 46, category: '입력/조작', termKr: '도우미 문구', termEn: 'Helper Text', summary: '하단 상세 도움말.', detail: '입력창 아래에 \'8자 이상, 특수문자 포함\'처럼 구체적인 작성 규칙을 작게 적어줍니다. 사용자가 입력 실수를 하지 않도록 미리 가이드라인을 제시합니다.', promptKr: '비밀번호 입력창 아래에 \'특수문자 포함\'이라는 도우미 문구를 추가해줘.', promptEn: 'Add Helper Text below the password field saying \'Include special characters\'.', related: [33] },
  { id: 47, category: '입력/조작', termKr: '유효성 검사', termEn: 'Validation', summary: '입력 규칙 확인.', detail: '이메일 주소에 \'@\'가 빠졌거나 비밀번호가 너무 짧을 때 시스템이 이를 감지하고 경고합니다. 잘못된 데이터가 전송되는 것을 막아주는 필수 기능입니다.', promptKr: '제출 버튼을 누르기 전에 이메일 형식이 맞는지 유효성 검사를 해줘.', promptEn: 'Perform Validation to check if the email format is correct before clicking submit.', related: [93] },
  { id: 48, category: '입력/조작', termKr: '입력 마스크', termEn: 'Input Mask', summary: '자동 서식 적용.', detail: '전화번호나 날짜를 입력할 때 사용자가 숫자만 쳐도 자동으로 하이픈(-)이나 슬래시(/)를 넣어줍니다. 입력 형식을 통일하고 사용자의 번거로움을 줄여줍니다.', promptKr: '전화번호를 입력할 때 자동으로 하이픈이 생기는 입력 마스크를 적용해줘.', promptEn: 'Apply an Input Mask that automatically inserts hyphens when entering a phone number.', related: [37] },
  { id: 49, category: '입력/조작', termKr: '리액트 훅 폼', termEn: 'React Hook Form', summary: '고성능 폼 라이브러리.', detail: '입력할 것이 많은 설문조사나 회원가입 창에서, 글자를 칠 때마다 화면이 버벅대지 않게 최적화해줍니다. 코드가 간결해지고 유효성 검사도 쉽게 붙일 수 있습니다.', promptKr: '설문조사 입력폼이 길어도 느려지지 않게 React Hook Form을 사용해서 최적화해줘.', promptEn: 'Optimize the long survey form using React Hook Form to prevent lag.', related: [37] },
  { id: 50, category: '입력/조작', termKr: '체크박스', termEn: 'Checkbox', summary: '다중 선택 박스.', detail: '네모난 박스 형태로, 여러 개의 선택지 중에서 원하는 것을 제한 없이 모두 고를 수 있을 때 사용합니다. \'취미 선택\'이나 \'약관 동의\' 등에 쓰입니다.', promptKr: '취미를 여러 개 선택할 수 있도록 체크박스 목록을 만들어줘.', promptEn: 'Create a list of Checkboxes to allow selecting multiple hobbies.', related: [41] },
  { id: 51, category: '입력/조작', termKr: '라디오 버튼', termEn: 'Radio Button', summary: '단일 선택 버튼.', detail: '동그란 버튼 형태로, 여러 선택지 중 반드시 하나만 골라야 할 때 사용합니다. \'성별 선택\'이나 \'배송 방법\'처럼 양자택일 상황에 적합합니다.', promptKr: '성별은 하나만 선택할 수 있게 라디오 버튼으로 구성해줘.', promptEn: 'Configure gender selection as Radio Buttons so only one can be chosen.', related: [40] },
  { id: 52, category: '입력/조작', termKr: '토글 스위치', termEn: 'Toggle Switch', summary: 'ON/OFF 스위치.', detail: '전등 스위치처럼 설정을 켜거나 끌 때 사용하는 직관적인 버튼입니다. 변경 사항이 저장 버튼 없이 즉시 반영되는 설정 화면에 주로 쓰입니다.', promptKr: '알림 설정을 켜고 끌 수 있는 토글 스위치를 만들어줘.', promptEn: 'Create a Toggle Switch to turn notification settings on and off.', related: [40] },
  { id: 53, category: '입력/조작', termKr: '슬라이더', termEn: 'Range Slider', summary: '범위 조절 막대.', detail: '막대 위에서 손잡이를 드래그하여 수치를 조절합니다. 정확한 숫자 입력보다는 음량 조절이나 가격대 설정처럼 대략적인 범위를 정할 때 편리합니다.', promptKr: '가격을 범위로 지정할 수 있는 슬라이더를 검색 필터에 넣어줘.', promptEn: 'Put a Range Slider in the search filter to specify a price range.', related: [42] },
  { id: 54, category: '입력/조작', termKr: '드롭다운', termEn: 'Dropdown', summary: '펼침 선택 메뉴.', detail: '평소에는 닫혀 있다가 클릭하면 아래로 목록이 펼쳐지는 메뉴입니다. 공간을 적게 차지하면서도 많은 선택지를 제공할 수 있어 지역 선택 등에 많이 쓰입니다.', promptKr: '지역 선택을 위해 클릭하면 목록이 내려오는 드롭다운을 만들어줘.', promptEn: 'Make a Dropdown that reveals a list for region selection when clicked.', related: [45] },
  { id: 55, category: '입력/조작', termKr: '콤보박스', termEn: 'Combobox', summary: '검색 가능 드롭다운.', detail: '드롭다운 목록이 너무 길 때, 사용자가 직접 검색어를 입력하여 항목을 찾을 수 있게 합쳐진 형태입니다. 수백 개의 국가나 회사 이름을 찾을 때 유용합니다.', promptKr: '목록이 너무 많으니 검색해서 선택할 수 있는 콤보박스로 만들어줘.', promptEn: 'Make it a Combobox to search and select since the list is too long.', related: [47] },
  { id: 56, category: '입력/조작', termKr: '멀티셀렉트', termEn: 'Multi-select', summary: '다중 선택 드롭다운.', detail: '드롭다운 메뉴 안에서 체크박스 등을 이용해 여러 개의 값을 동시에 선택합니다. 선택된 항목들은 태그(Chip) 형태로 표시되는 경우가 많습니다.', promptKr: '드롭다운 메뉴 안에서 여러 태그를 동시에 선택할 수 있는 멀티셀렉트 기능을 넣어줘.', promptEn: 'Insert a Multi-select feature within the dropdown menu to choose multiple tags at once.', related: [40] },
  { id: 57, category: '입력/조작', termKr: '자동완성', termEn: 'Autocomplete', summary: '추천 검색어 표시.', detail: '검색창에 글자를 입력하기 시작하면, 관련된 단어나 문장을 예측하여 리스트로 보여줍니다. 사용자의 타자 수고를 덜어주고 검색 정확도를 높여줍니다.', promptKr: '검색창에 글자를 입력하면 추천 검색어가 뜨는 자동완성 기능을 구현해줘.', promptEn: 'Implement Autocomplete to show recommended search terms while typing in the search bar.', related: [56] },
  { id: 58, category: '입력/조작', termKr: '날짜/시간 선택기', termEn: 'Date/Time Picker', summary: '달력/시계 팝업.', detail: '날짜를 직접 입력하는 대신 달력이나 시계 모양의 팝업을 띄워 선택하게 합니다. 요일이나 형식을 헷갈리지 않고 정확하게 예약 시간을 잡을 때 필수적입니다.', promptKr: '예약일 지정을 위해 팝업 달력이 뜨는 날짜 선택기를 추가해줘.', promptEn: 'Add a Date Picker that pops up a calendar for selecting the reservation date.', related: [38] },
  { id: 59, category: '입력/조작', termKr: '파일 업로드', termEn: 'File Upload', summary: '파일 첨부 기능.', detail: '사용자의 컴퓨터나 폰에 있는 사진, 문서를 웹사이트로 전송하는 버튼입니다. 보통 \'파일 선택\' 버튼을 누르면 탐색기가 열리는 방식입니다.', promptKr: '사용자가 문서를 첨부할 수 있는 파일 업로드 영역을 만들어줘.', promptEn: 'Create a File Upload area where users can attach documents.', related: [51] },
  { id: 60, category: '입력/조작', termKr: '파일 업로드 미리보기', termEn: 'File Preview', summary: '업로드 전 썸네일.', detail: '이미지를 서버로 보내기 전에, 사용자가 선택한 사진이 맞는지 화면에 작게 보여줍니다. 잘못된 파일을 올리는 실수를 줄여줍니다.', promptKr: '이미지를 업로드하면 바로 썸네일로 보여주는 미리보기 기능을 넣어줘.', promptEn: 'Include a File Preview feature that shows a thumbnail immediately after uploading an image.', related: [49] },
  { id: 61, category: '입력/조작', termKr: '드래그 앤 드롭', termEn: 'Drag & Drop', summary: '끌어다 놓기 조작.', detail: '마우스로 파일을 잡아서 끌어다 놓는 직관적인 동작으로 업로드를 하거나, 리스트의 순서를 바꿀 때 사용합니다. PC 환경에서 매우 편리한 UX를 제공합니다.', promptKr: '파일을 마우스로 끌어다 놓아서 업로드하는 드래그 앤 드롭 기능을 지원해줘.', promptEn: 'Support Drag & Drop functionality to upload files by dragging them with the mouse.', related: [114] },
  { id: 62, category: '입력/조작', termKr: '플로팅 액션 버튼', termEn: 'FAB', summary: '둥둥 떠 있는 주요 버튼.', detail: '화면 구석(주로 우측 하단)에 고정되어 떠 있는 원형 버튼입니다. \'글쓰기\'처럼 해당 페이지에서 가장 중요한 핵심 기능을 언제든 실행할 수 있게 합니다.', promptKr: '새 글 작성 버튼은 화면 우측 하단에 고정된 플로팅 액션 버튼(FAB)으로 만들어줘.', promptEn: 'Make the \'New Post\' button a Floating Action Button (FAB) fixed at the bottom right.', related: [126] },
  { id: 63, category: '입력/조작', termKr: '제스처 UI', termEn: 'Gesture UI', summary: '터치 동작 인식.', detail: '탭, 스와이프(밀기), 핀치(집기) 같은 손가락 동작을 인식하여 기능을 수행합니다. 모바일 앱에서 화면을 옆으로 밀어 뒤로 가거나, 사진을 확대할 때 쓰입니다.', promptKr: '모바일에서 옆으로 밀면 삭제되는 스와이프 제스처 UI를 구현해줘.', promptEn: 'Implement a Swipe Gesture UI on mobile to delete items by sliding sideways.', related: [125] },
  { id: 64, category: '입력/조작', termKr: '세그먼트 컨트롤', termEn: 'Segmented Control', summary: '가로 분할 선택 버튼.', detail: '두세 개의 옵션이 가로로 딱 붙어있는 버튼 그룹입니다. \'지도 보기 / 목록 보기\'처럼 뷰 모드를 전환하거나, 즉각적인 옵션 변경이 필요할 때 씁니다.', promptKr: '보기 방식을 \'목록형/카드형\' 중에서 선택하는 세그먼트 컨트롤을 상단에 배치해줘.', promptEn: 'Place a Segmented Control at the top to toggle between \'List/Card\' view modes.', related: [22] },
  { id: 65, category: '입력/조작', termKr: '카운터', termEn: 'Counter', summary: '수량 조절 버튼.', detail: '숫자 양옆에 플러스(+)와 마이너스(-) 버튼이 달린 입력기입니다. 쇼핑몰 장바구니에서 상품 개수를 변경할 때 가장 흔하게 볼 수 있습니다.', promptKr: '쇼핑 카트에 상품 개수를 조절할 수 있는 플러스/마이너스 카운터를 넣어줘.', promptEn: 'Put a plus/minus Counter in the shopping cart to adjust item quantity.', related: [43] },
  { id: 66, category: '입력/조작', termKr: '검색 바', termEn: 'Search Bar', summary: '검색어 입력창.', detail: '사용자가 찾고 싶은 내용을 입력하는 창으로, 보통 돋보기 아이콘과 함께 배치됩니다. 사이트의 내비게이션 못지않게 중요한 탐색 도구입니다.', promptKr: '헤더 중앙에 돋보기 아이콘이 포함된 둥근 검색 바를 위치시켜줘.', promptEn: 'Position a rounded Search Bar with a magnifying glass icon in the center of the header.', related: [47] },
  { id: 67, category: '입력/조작', termKr: '위지윅 에디터', termEn: 'WYSIWYG', summary: '보이는 대로 편집기.', detail: '한글이나 워드처럼 글자 굵기, 색상 등을 버튼으로 조절하며 편집하는 도구입니다. 사용자가 HTML 코드를 몰라도 풍부한 서식의 글을 쓸 수 있게 해줍니다.', promptKr: '공지사항 작성란에 글자 굵기나 색상을 바꿀 수 있는 위지윅 에디터를 달아줘.', promptEn: 'Attach a WYSIWYG editor to the announcement field to change font weight or color.', related: [134] },
  { id: 68, category: '입력/조작', termKr: '텍스트에어리어', termEn: 'Textarea', summary: '다중 행 입력창.', detail: '한 줄짜리 짧은 입력창이 아니라, 게시글 본문이나 문의 내용처럼 긴 글을 작성할 수 있는 큰 박스입니다. 내용이 많아지면 스크롤이 생기거나 박스가 늘어나기도 합니다.', promptKr: '문의 내용을 자세히 적을 수 있게 5줄짜리 텍스트에어리어를 만들어줘.', promptEn: 'Make a 5-row Textarea to verify detailed inquiry content.', related: [43] },
  { id: 69, category: '입력/조작', termKr: '핀 입력 / OTP', termEn: 'PIN Input', summary: '인증번호 분할 입력.', detail: '4자리나 6자리 인증번호를 한 글자씩 따로 입력하도록 칸이 나뉘어 있습니다. 숫자를 하나 치면 자동으로 다음 칸으로 포커스가 넘어가 편리합니다.', promptKr: '인증번호 6자리를 입력하는 칸을 만들고, 입력 시 자동 포커스 이동을 시켜줘.', promptEn: 'Create a 6-digit PIN Input with auto-focus movement upon typing.', related: [38] },
  { id: 70, category: '입력/조작', termKr: '컬러 피커', termEn: 'Color Picker', summary: '색상 선택 도구.', detail: '사용자가 팔레트나 무지개 막대에서 원하는 색을 직접 찍어서 고를 수 있게 해주는 UI입니다. 테마 색상을 직접 꾸미거나 디자인 관련 앱에서 필수적입니다.', promptKr: '사용자가 배경색을 마음대로 바꿀 수 있게 컬러 피커를 달아줘.', promptEn: 'Attach a Color Picker so users can customize the background color.', related: [12] },
  { id: 71, category: '입력/조작', termKr: '멘션', termEn: 'Mention', summary: '사용자 호출 태그.', detail: '채팅창이나 댓글에서 \'@\' 기호를 치면 사용자 목록이 떠서 특정인을 지목(태그) 할 수 있는 기능입니다. 협업 툴이나 SNS에서 상대를 호출할 때 씁니다.', promptKr: '댓글 창에 @를 입력하면 친구 목록이 뜨는 멘션 기능을 구현해줘.', promptEn: 'Implement a Mention feature showing a friend list when typing @ in comments.', related: [39] },
  { id: 72, category: '입력/조작', termKr: '리치 텍스트 에디터', termEn: 'Rich Text Editor', summary: '고급 서식 편집기.', detail: '위지윅 에디터의 일종으로, 이미지 삽입, 표 만들기, 동영상 넣기 등 블로그 수준의 복잡한 글쓰기 기능을 제공합니다. 단순 텍스트 이상의 콘텐츠를 만들 때 사용합니다.', promptKr: '블로그처럼 사진과 글을 자유롭게 쓸 수 있는 리치 텍스트 에디터를 붙여줘.', promptEn: 'Attach a Rich Text Editor allowing free use of photos and text like a blog.', related: [67] },
  { id: 73, category: '입력/조작', termKr: '썸/업다운', termEn: 'Thumbs Up/Down', summary: '이분법적 평가 버튼.', detail: '유튜브의 \'좋아요/싫어요\'처럼 호불호를 명확하게 선택하는 버튼입니다. 5점 만점 별점보다 고민할 시간이 적게 걸려 참여율이 높습니다.', promptKr: 'AI 답변이 좋은지 나쁜지 평가하는 업/다운 버튼을 답변 아래에 둬.', promptEn: 'Place Thumbs Up/Down buttons below the answer to rate the AI.', related: [79] },

  // 4. 정보 표시 및 데이터 (Data Display)
  { id: 74, category: '정보/데이터', termKr: '데이터 그리드', termEn: 'Data Grid', summary: '고기능 엑셀형 테이블.', detail: '단순한 표를 넘어, 엑셀처럼 정렬(Sort), 필터(Filter), 검색, 수정이 가능한 강력한 데이터 테이블입니다. 관리자 페이지에서 대량의 데이터를 다룰 때 필수적입니다.', promptKr: '대량의 데이터를 정렬하고 필터링할 수 있는 데이터 그리드 컴포넌트를 사용해줘.', promptEn: 'Use a Data Grid component to sort and filter large amounts of data.', related: [61] },
  { id: 75, category: '정보/데이터', termKr: '트레머', termEn: 'Tremor', summary: '대시보드 전용 차트 라이브러리.', detail: '디자인 감각이 없어도 데이터를 넣기만 하면 깔끔하고 전문적인 차트를 그려주는 리액트 라이브러리입니다. 빠르게 대시보드를 구축해야 할 때 아주 유용합니다.', promptKr: '학생 성적 현황 차트는 Tremor 라이브러리를 사용해서 전문적인 느낌을 줘.', promptEn: 'Use the Tremor library for student grade charts to give it a professional look.', related: [69] },
  { id: 76, category: '정보/데이터', termKr: '디쓰리 제이에스', termEn: 'D3.js', summary: '데이터 시각화 끝판왕.', detail: '데이터를 이용해 단순한 그래프뿐만 아니라, 지도, 관계망, 움직이는 차트 등 예술적인 시각화를 구현할 수 있는 도구입니다. 난이도가 높지만 표현의 자유도가 무한합니다.', promptKr: '역사 연표를 D3.js를 사용해서 상호작용 가능한 시각화로 구현해줘.', promptEn: 'Implement an interactive historical timeline visualization using D3.js.', related: [69] },
  { id: 77, category: '정보/데이터', termKr: '표', termEn: 'Table', summary: '기본 행열 데이터 표시.', detail: '데이터를 가로(행)와 세로(열)로 단순하게 정리하여 보여주는 가장 기본적인 형식입니다. 복잡한 기능 없이 정보 전달에 충실할 때 사용합니다.', promptKr: '학생 성적 데이터를 5열짜리 기본 표 형식으로 보여줘.', promptEn: 'Show student grade data in a basic 5-column Table format.', related: [58] },
  { id: 78, category: '정보/데이터', termKr: '아바타', termEn: 'Avatar', summary: '원형 프로필 이미지.', detail: '사용자의 얼굴 사진이나 이니셜을 동그라미 안에 보여주는 요소입니다. 댓글이나 목록에서 누가 작성했는지 식별할 때 시각적인 도움을 줍니다.', promptKr: '사용자 이름 옆에 원형 아바타 이미지를 배치해줘.', promptEn: 'Place a circular Avatar image next to the username.', related: [63] },
  { id: 79, category: '정보/데이터', termKr: '아바타 그룹', termEn: 'Avatar Group', summary: '겹침 프로필 목록.', detail: '여러 명의 아바타를 약간씩 겹쳐서 나열합니다. \'참여자 5명\', \'팔로워 10명\' 등을 좁은 공간에 효율적으로 보여주며 소속감을 줍니다.', promptKr: '참여자 목록을 3명까지 겹쳐서 보여주는 아바타 그룹으로 만들어줘.', promptEn: 'Create an Avatar Group showing up to 3 participants overlapping each other.', related: [62] },
  { id: 80, category: '정보/데이터', termKr: '칩/태그', termEn: 'Chip/Tag', summary: '알약형 키워드 버튼.', detail: '둥근 알약 모양의 작은 박스 안에 카테고리나 키워드를 넣습니다. 게시글의 주제를 분류하거나 필터 조건을 표시할 때 주로 사용합니다. ', promptKr: '게시글의 카테고리를 둥근 알약 모양의 칩으로 표시해줘.', promptEn: 'Display the post categories as rounded pill-shaped Chips.', related: [46] },
  { id: 81, category: '정보/데이터', termKr: '리스트 아이템', termEn: 'List Item', summary: '목록의 한 줄 단위.', detail: '목록을 구성하는 개별 줄을 말합니다. 보통 \'아이콘 + 텍스트 + 화살표\' 구조로 이루어져 있으며, 클릭하면 상세 내용으로 이동합니다.', promptKr: '각 리스트 아이템마다 왼쪽에 아이콘, 오른쪽에 화살표를 넣어줘.', promptEn: 'Put an icon on the left and an arrow on the right for each List Item.', related: [61] },
  { id: 82, category: '정보/데이터', termKr: '캐러셀', termEn: 'Carousel', summary: '회전목마 슬라이더.', detail: '한정된 공간에서 여러 장의 이미지나 배너를 옆으로 넘겨가며 보여줍니다. 쇼핑몰 메인 배너처럼 좁은 공간에 많은 정보를 담아야 할 때 효과적입니다.', promptKr: '이벤트 배너들을 옆으로 넘겨볼 수 있는 캐러셀을 메인에 넣어줘.', promptEn: 'Insert a Carousel on the main page to slide through event banners.', related: [67] },
  { id: 83, category: '정보/데이터', termKr: '스와이퍼 제이에스', termEn: 'Swiper.js', summary: '터치 슬라이드 라이브러리.', detail: '모바일에서 손가락으로 쓱 넘기는(스와이프) 동작을 아주 부드럽게 구현해 주는 유명한 도구입니다. 캐러셀을 만들 때 표준처럼 사용됩니다.', promptKr: 'Swiper.js를 사용해서 손으로 넘겨볼 수 있는 부드러운 이미지 슬라이더를 만들어줘.', promptEn: 'Create a smooth touch-enabled image slider using Swiper.js.', related: [66] },
  { id: 84, category: '정보/데이터', termKr: '아코디언', termEn: 'Accordion', summary: '접이식 내용 목록.', detail: '제목을 누르면 숨겨진 내용이 아래로 펼쳐지고, 다시 누르면 접히는 방식입니다. FAQ(자주 묻는 질문)처럼 내용이 길지만 한 번에 다 보여줄 필요가 없을 때 공간을 절약합니다.', promptKr: '자주 묻는 질문(FAQ)은 제목을 누르면 내용이 나오는 아코디언으로 만들어줘.', promptEn: 'Make the FAQ section an Accordion where content expands upon clicking the title.', related: [65] },
  { id: 85, category: '정보/데이터', termKr: '차트 컴포넌트', termEn: 'Chart Component', summary: '그래프 시각화 부품.', detail: '막대그래프, 원형 그래프, 꺾은선 그래프 등 수치 데이터를 알기 쉽게 그림으로 그려주는 부품입니다. 숫자로만 된 표보다 훨씬 직관적으로 추세를 파악하게 해줍니다.', promptKr: '월별 매출 추이를 꺾은선 차트 컴포넌트로 시각화해줘.', promptEn: 'Visualize monthly sales trends with a line Chart Component.', related: [59] },
  { id: 86, category: '정보/데이터', termKr: '컨텍스트 메뉴', termEn: 'Context Menu', summary: '우클릭 보조 메뉴.', detail: '마우스 오른쪽 버튼을 클릭했을 때 그 위치에 나타나는 메뉴입니다. 파일 관리자에서 \'복사\', \'삭제\', \'이름 바꾸기\' 같은 추가 작업을 제공할 때 씁니다.', promptKr: '파일을 우클릭하면 \'다운로드\', \'삭제\'가 나오는 컨텍스트 메뉴를 구현해줘.', promptEn: 'Implement a Context Menu showing \'Download\' and \'Delete\' on right-click.', related: [71] },
  { id: 87, category: '정보/데이터', termKr: '드롭다운 메뉴', termEn: 'Dropdown Menu', summary: '더보기 버튼 메뉴.', detail: '점 3개(...) 버튼이나 화살표를 눌렀을 때 작게 뜨는 메뉴 목록입니다. 화면에 다 꺼내놓기엔 덜 중요하거나 자리가 부족한 기능들을 모아둡니다.', promptKr: '\'더보기\' 버튼을 누르면 수정/삭제 옵션이 나오는 드롭다운 메뉴를 달아줘.', promptEn: 'Attach a Dropdown Menu with edit/delete options when the \'More\' button is pressed.', related: [44] },
  { id: 88, category: '정보/데이터', termKr: '대시보드', termEn: 'Dashboard', summary: '현황판 요약 페이지.', detail: '여러 데이터의 핵심 지표(KPI), 차트, 최근 활동 등을 한 화면에 모아 현재 상황을 한눈에 파악할 수 있게 만든 관리자용 메인 페이지입니다.', promptKr: '주요 지표들을 한눈에 볼 수 있는 관리자 대시보드 화면을 구성해줘.', promptEn: 'Construct an admin Dashboard screen to view key metrics at a glance.', related: [59] },
  { id: 89, category: '정보/데이터', termKr: '트리 뷰', termEn: 'Tree View', summary: '계층 구조 목록.', detail: '윈도우 탐색기의 폴더 구조처럼 상위 항목을 누르면 하위 항목이 가지치기하듯 열리는 목록입니다. 조직도나 파일 경로를 표현할 때 적합합니다.', promptKr: '조직도를 폴더처럼 펼치고 접을 수 있는 트리 뷰로 표현해줘.', promptEn: 'Represent the organization chart as a collapsible Tree View like folders.', related: [68] },
  { id: 90, category: '정보/데이터', termKr: '트리 맵', termEn: 'Tree Map', summary: '면적 비중 차트.', detail: '큰 사각형 안에 작은 사각형들을 채워 넣어, 면적의 크기로 데이터의 비중을 보여줍니다. 예산 분포나 주식 시장의 등락을 한눈에 비교할 때 씁니다.', promptKr: '예산 비중을 사각형 면적 크기로 보여주는 트리 맵 차트를 그려줘.', promptEn: 'Draw a Tree Map chart showing budget proportions as rectangle sizes.', related: [75] },
  { id: 91, category: '정보/데이터', termKr: '히트맵', termEn: 'Heatmap', summary: '색상 농도 분포도.', detail: '데이터가 많거나 집중된 곳을 붉은색이나 진한 색으로 표현합니다. 사용자가 웹사이트의 어느 부분을 많이 클릭했는지, 혹은 시간대별 활동량을 보여줄 때 유용합니다.', promptKr: '클릭이 많이 일어나는 구역을 색상 농도로 표현하는 히트맵을 보여줘.', promptEn: 'Show a Heatmap representing high-click areas with color intensity.', related: [74] },
  { id: 92, category: '정보/데이터', termKr: '타임라인', termEn: 'Timeline', summary: '시간 순서 나열.', detail: '역사적 사건이나 배송 과정, 이력 등을 시간 흐름에 따라 수직선이나 수평선 위에 나열하여 보여줍니다. 과정의 흐름을 파악하기 좋습니다.', promptKr: '배송 조회 현황을 수직 타임라인 디자인으로 보여줘.', promptEn: 'Show the delivery tracking status in a vertical Timeline design.', related: [26] },
  { id: 93, category: '정보/데이터', termKr: '통계 카드', termEn: 'Stat Card', summary: '핵심 숫자 요약 카드.', detail: '\'오늘 방문자 수\', \'총매출\' 같은 중요한 숫자 하나를 크게 강조하고, 작은 미니 그래프와 함께 보여주는 박스입니다. 대시보드 최상단에 주로 배치됩니다.', promptKr: '총 방문자 수와 증가율을 보여주는 통계 카드를 상단에 배치해줘.', promptEn: 'Place a Stat Card showing total visitors and growth rate at the top.', related: [72] },
  { id: 94, category: '정보/데이터', termKr: '칸반 보드', termEn: 'Kanban Board', summary: '상태별 업무 카드 이동.', detail: '\'할 일\', \'진행 중\', \'완료\'라는 기둥(Column)을 세우고, 업무 카드를 드래그해서 옮기며 진행 상황을 관리하는 보드입니다. 트렐로(Trello)가 대표적입니다.', promptKr: '할 일을 \'대기중\', \'진행중\', \'완료\'로 옮길 수 있는 칸반 보드를 만들어줘.', promptEn: 'Create a Kanban Board to move tasks between \'To Do\', \'In Progress\', and \'Done\'.', related: [114] },
  { id: 95, category: '정보/데이터', termKr: '별점 평가', termEn: 'Star Rating', summary: '5점 만점 평가.', detail: '별 5개 아이콘을 클릭하여 만족도를 점수로 매기는 직관적인 UI입니다. 쇼핑몰 리뷰나 영화 평점 등에서 가장 보편적으로 쓰입니다.', promptKr: '사용자가 5점 만점으로 리뷰를 남길 수 있는 별점 평가 UI를 넣어줘.', promptEn: 'Insert a Star Rating UI for users to leave reviews out of 5 stars.', related: [37] },
  { id: 96, category: '정보/데이터', termKr: '벌크 액션', termEn: 'Bulk Actions', summary: '다중 선택 일괄 처리.', detail: '목록에서 여러 개의 항목을 체크박스로 선택한 뒤, \'삭제\'나 \'이동\' 버튼을 한 번만 눌러 싹 처리하는 기능입니다. 반복 작업을 줄여줍니다.', promptKr: '여러 항목을 체크해서 한 번에 삭제하는 벌크 액션 기능을 구현해줘.', promptEn: 'Implement Bulk Actions to check multiple items and delete them at once.', related: [58] },
  { id: 97, category: '정보/데이터', termKr: '인라인 에디트', termEn: 'Inline Edit', summary: '즉시 수정 기능.', detail: '수정 버튼을 눌러 별도 페이지로 이동하지 않고, 텍스트를 클릭하면 그 자리에서 바로 입력창으로 변해 내용을 고칠 수 있는 기능입니다.', promptKr: '페이지 이동 없이 표 안에서 바로 글자를 수정하는 인라인 에디트를 적용해줘.', promptEn: 'Apply Inline Edit to modify text directly within the table without leaving the page.', related: [58] },
  { id: 98, category: '정보/데이터', termKr: '캘린더 뷰', termEn: 'Calendar View', summary: '달력형 데이터 표시.', detail: '일정이나 예약 데이터를 일반 목록이 아닌 달력 형태로 보여줍니다. 월별, 주별 스케줄을 한눈에 파악하고 빈 시간을 찾기에 최적화된 화면입니다.', promptKr: '예약된 날짜를 한눈에 볼 수 있게 캘린더 뷰로 보여줘.', promptEn: 'Display the reserved dates in a Calendar View for a quick overview.', related: [48] },
  { id: 99, category: '정보/데이터', termKr: '디프 뷰', termEn: 'Diff View', summary: '변경 사항 비교 화면.', detail: '수정 전 파일과 수정 후 파일을 좌우에 나란히 놓고, 바뀐 부분을 색깔로 표시해 줍니다. 코드 리뷰나 문서 히스토리 관리에서 무엇이 달라졌는지 찾을 때 씁니다.', promptKr: 'AI가 수정한 코드가 원본과 어떻게 다른지 디프 뷰로 비교해줘.', promptEn: 'Compare the AI-modified code with the original using a Diff View.', related: [195] },
  { id: 100, category: '정보/데이터', termKr: '워드 클라우드', termEn: 'Word Cloud', summary: '단어 빈도 시각화.', detail: '텍스트 데이터에서 많이 등장한 단어일수록 글자를 크고 굵게 보여주는 구름 모양 차트입니다. 리뷰나 댓글의 핵심 키워드를 한눈에 파악할 때 유용합니다.', promptKr: '고객 리뷰에서 자주 나오는 단어를 워드 클라우드로 시각화해줘.', promptEn: 'Visualize frequent words from customer reviews as a Word Cloud.', related: [69] },
  { id: 101, category: '정보/데이터', termKr: '타임스탬프', termEn: 'Timestamp', summary: '상대적 시간 표시.', detail: '\'2024-01-01 10:00\' 같은 딱딱한 날짜 대신 \'방금 전\', \'3분 전\'처럼 현재 기준으로 얼마나 지났는지를 보여줍니다. SNS 타임라인에서 현장감을 줍니다.', promptKr: '댓글 작성 시간을 \'방금 전\', \'1시간 전\' 같은 타임스탬프로 표시해줘.', promptEn: 'Display comment times as relative Timestamps like \'Just now\' or \'1 hour ago\'.', related: [48] },
  { id: 102, category: '정보/데이터', termKr: 'KPI 카드', termEn: 'KPI Card', summary: '핵심 지표 표시.', detail: '통계 카드와 비슷하지만, 비즈니스 목표 달성 여부를 보여주는 데 집중합니다. \'목표 대비 90% 달성\' 같은 퍼센트와 상태(좋음/나쁨)를 함께 보여줍니다.', promptKr: '이번 달 총수익을 보여주는 KPI 카드를 대시보드 상단에 배치해줘.', promptEn: 'Place a KPI Card showing this month\'s total revenue at the top of the dashboard.', related: [93] },
  { id: 103, category: '정보/데이터', termKr: '코드 스니펫', termEn: 'Code Snippet', summary: '코드 조각 복사 박스.', detail: '개발자 문서나 블로그에서 프로그래밍 코드를 보여줄 때 씁니다. 문법에 따라 색상을 입히고(하이라이팅), 원클릭 복사 버튼을 제공하여 편의성을 높입니다.', promptKr: '사용자가 가져다 쓸 수 있는 예제 코드를 코드 스니펫 형태로 제공해줘.', promptEn: 'Provide example code as a Code Snippet that users can copy and use.', related: [134] },

  // 5. 상태 및 피드백 (Status & Feedback)
  { id: 104, category: '상태/피드백', termKr: '모달', termEn: 'Modal', summary: '중앙 집중 팝업창.', detail: '배경을 어둡게 처리하고 화면 중앙에 뜨는 창으로, 사용자가 확인 버튼을 누르기 전까지는 배경을 조작할 수 없습니다. 중요한 경고나 확인이 필요할 때 강제로 집중시킵니다.', promptKr: '삭제 버튼을 누르면 정말 삭제할지 묻는 모달 창을 띄워줘.', promptEn: 'Pop up a Modal window asking to confirm deletion when the delete button is clicked.', related: [84] },
  { id: 105, category: '상태/피드백', termKr: '소너', termEn: 'Sonner', summary: '최신형 토스트 알림.', detail: '디자인이 매우 깔끔하고 애니메이션이 부드러운 최신 알림 라이브러리입니다. 여러 알림이 겹쳐서 나올 때도 보기 좋게 정리해서 보여줍니다.', promptKr: '저장 완료 알림은 Sonner 라이브러리를 써서 화면 하단에 깔끔하게 띄워줘.', promptEn: 'Use the Sonner library to display clean \'Saved\' toast notifications at the bottom.', related: [85] },
  { id: 106, category: '상태/피드백', termKr: '알럿', termEn: 'Alert', summary: '경고 메시지 박스.', detail: '화면 상단이나 콘텐츠 중간에 나타나는 색상 박스(빨강, 노랑 등)로, 오류나 주의사항을 강조해서 보여줍니다. 사용자가 꼭 알아야 할 정보를 전달합니다.', promptKr: '저장되지 않은 내용이 있을 때 경고 알럿을 보여줘.', promptEn: 'Show a warning Alert when there is unsaved content.', related: [82] },
  { id: 107, category: '상태/피드백', termKr: '스낵바/토스트', termEn: 'Snackbar/Toast', summary: '휘발성 알림 메시지.', detail: '화면 구석에 잠시 나타났다가 몇 초 뒤 자동으로 사라지는 가벼운 메시지입니다. \'저장되었습니다\'처럼 작업의 성공 여부를 방해 없이 알려줄 때 씁니다.', promptKr: '저장이 완료되면 하단에 \'저장됨\'이라는 스낵바 메시지를 띄워줘.', promptEn: 'Display a \'Saved\' Snackbar message at the bottom when saving is complete.', related: [83] },
  { id: 108, category: '상태/피드백', termKr: '툴팁', termEn: 'Tooltip', summary: '마우스 오버 설명.', detail: '아이콘이나 버튼에 마우스를 올렸을 때 말풍선 모양으로 나타나는 도움말입니다. 공간이 부족해 다 적지 못한 기능 이름을 설명해 줄 때 유용합니다.', promptKr: '이 아이콘에 마우스를 올리면 기능 설명이 나오는 툴팁을 달아줘.', promptEn: 'Attach a Tooltip to this icon that explains the function on hover.', related: [87] },
  { id: 109, category: '상태/피드백', termKr: '팝오버', termEn: 'Popover', summary: '클릭형 상세 말풍선.', detail: '툴팁보다 더 많은 정보나 버튼을 담고 있는 큰 말풍선입니다. 클릭해야 나타나며, 간단한 메뉴나 프로필 정보를 보여줄 때 사용합니다.', promptKr: '프로필을 클릭하면 메뉴 목록이 담긴 팝오버가 뜨게 해줘.', promptEn: 'Make a Popover with a menu list appear when the profile is clicked.', related: [86] },
  { id: 110, category: '상태/피드백', termKr: '배지', termEn: 'Badge', summary: '알림 개수 표시.', detail: '아이콘 모서리에 붙는 작은 빨간 점이나 숫자입니다. \'안 읽은 메시지 3개\'처럼 새로운 소식이 있음을 시각적으로 주의를 끌어 알려줍니다.', promptKr: '읽지 않은 메시지 개수를 보여주는 빨간색 배지를 아이콘 위에 달아줘.', promptEn: 'Attach a red Badge on the icon showing the count of unread messages.', related: [85] },
  { id: 111, category: '상태/피드백', termKr: '로딩 스피너', termEn: 'Spinner', summary: '회전 로딩 아이콘.', detail: '데이터가 로딩 중일 때 빙글빙글 돌아가는 원형 아이콘입니다. 시스템이 멈춘 게 아니라 열심히 일하는 중이라는 것을 알려주어 사용자를 안심시킵니다.', promptKr: '데이터를 불러오는 동안 중앙에 로딩 스피너가 돌아가게 해줘.', promptEn: 'Let a Loading Spinner spin in the center while fetching data.', related: [90] },
  { id: 112, category: '상태/피드백', termKr: '스켈레톤 스크린', termEn: 'Skeleton Screen', summary: '로딩 중 뼈대 화면.', detail: '로딩되는 동안 텅 빈 화면 대신, 글자와 이미지 모양의 회색 박스를 미리 보여줍니다. 화면이 곧 뜰 것 같은 느낌을 주어 체감 대기 시간을 줄여줍니다.', promptKr: '로딩 중에 빈 화면 대신 회색 박스로 된 스켈레톤 스크린을 먼저 보여줘.', promptEn: 'Show a gray box Skeleton Screen first instead of a blank screen while loading.', related: [89] },
  { id: 113, category: '상태/피드백', termKr: '프로그레스 바', termEn: 'Progress Bar', summary: '진행률 막대그래프.', detail: '작업이 0%에서 100%까지 얼마나 진행되었는지 가로 막대가 채워지는 애니메이션으로 보여줍니다. 파일 다운로드나 긴 처리 과정에서 남은 시간을 가늠하게 합니다.', promptKr: '파일 업로드 진행 상황을 보여주는 프로그레스 바를 표시해줘.', promptEn: 'Display a Progress Bar showing the file upload status.', related: [92] },
  { id: 114, category: '상태/피드백', termKr: '프로그레스 인디케이터', termEn: 'Progress Indicator', summary: '단계별 진행 표시기.', detail: '원형이나 단계 숫자로 진행 상황을 보여줍니다. \'3단계 중 1단계\'처럼 전체 과정 중 현재 위치를 알려주는 역할을 합니다.', promptKr: '설문조사가 얼마나 남았는지 원형 프로그레스 인디케이터로 보여줘.', promptEn: 'Show how much of the survey is left with a circular Progress Indicator.', related: [26] },
  { id: 115, category: '상태/피드백', termKr: '오류/성공 메시지', termEn: 'Error/Success Msg', summary: '결과 상태 피드백.', detail: '작업 결과에 따라 초록색(성공)이나 빨간색(실패)으로 텍스트 색상을 달리하여 보여줍니다. 사용자가 결과를 직관적으로 인지할 수 있게 돕습니다.', promptKr: '로그인에 실패하면 입력창 아래에 빨간색 오류 메시지를 출력해줘.', promptEn: 'Output a red Error Message below the input field if login fails.', related: [37] },
  { id: 116, category: '상태/피드백', termKr: '당겨서 새로고침', termEn: 'Pull to Refresh', summary: '모바일 새로고침 제스처.', detail: '모바일 앱 리스트 상단에서 화면을 아래로 쭉 당겼다가 놓으면 새로고침이 실행되는 동작입니다. 버튼을 누르는 것보다 훨씬 자연스러운 모바일 UX입니다.', promptKr: '모바일에서 리스트를 당기면 새로고침되는 기능을 구현해줘.', promptEn: 'Implement the Pull to Refresh feature on mobile to reload the list.', related: [119] },
  { id: 117, category: '상태/피드백', termKr: '엠티 스테이트', termEn: 'Empty State', summary: '빈 화면 안내.', detail: '데이터가 없을 때(예: 장바구니 0개) 단순히 비워두지 않고, 안내 문구나 버튼을 보여주는 화면입니다. 사용자가 다음에 무엇을 해야 할지 행동을 유도합니다.', promptKr: '장바구니가 비어있을 때 쇼핑을 유도하는 엠티 스테이트 화면을 디자인해줘.', promptEn: 'Design an Empty State screen that encourages shopping when the cart is empty.', related: [122] },
  { id: 118, category: '상태/피드백', termKr: '백드롭', termEn: 'Backdrop', summary: '모달 배경 가림막.', detail: '모달이나 팝업이 떴을 때 뒤에 깔리는 검은색 반투명 레이어입니다. 뒷 배경의 내용을 흐릿하게 가려 시선을 팝업에 집중시키고, 클릭하면 팝업이 닫히게 설정하기도 합니다.', promptKr: '모달 뒤에 흐린 검은색 백드롭을 깔고, 백드롭을 누르면 닫히게 해줘.', promptEn: 'Lay a dim black Backdrop behind the modal and close it when clicked.', related: [104] },
  { id: 119, category: '상태/피드백', termKr: '오프라인 모드', termEn: 'Offline Mode', summary: '연결 끊김 대응 상태.', detail: '인터넷 연결이 끊겼을 때 앱이 멈추거나 깨지지 않고, "연결을 확인해주세요"라고 알리거나 저장된 데이터만 보여주는 상태입니다. 안정적인 앱 사용 경험을 줍니다.', promptKr: '인터넷이 끊기면 상단에 \'오프라인 상태입니다\'라는 알림 띠를 띄워줘.', promptEn: 'Show an \'Offline\' notification bar at the top when connection is lost.', related: [116] },
  { id: 120, category: '상태/피드백', termKr: '컨펌 다이얼로그', termEn: 'Confirm Dialog', summary: '재확인 대화창.', detail: '삭제나 취소처럼 되돌릴 수 없는 행동을 하기 전에 "정말 하시겠습니까?"라고 한 번 더 묻는 창입니다. 실수로 중요한 데이터를 날리는 것을 방지합니다.', promptKr: '탈퇴 버튼을 누르면 정말 탈퇴할지 묻는 컨펌 다이얼로그를 띄워줘.', promptEn: 'Pop up a Confirm Dialog asking to verify withdrawal when the button is clicked.', related: [104] },
  { id: 121, category: '상태/피드백', termKr: '인디케이터', termEn: 'Indicator', summary: '상태 표시 점.', detail: '프로필 사진 옆에 붙은 작은 색깔 점으로 상태를 나타냅니다. 초록색은 \'온라인\', 회색은 \'오프라인\', 노란색은 \'자리 비움\'을 의미합니다.', promptKr: '사용자가 접속 중이면 프로필 옆에 초록색 인디케이터 점을 찍어줘.', promptEn: 'Put a green Indicator dot next to the profile if the user is online.', related: [110] },
  { id: 122, category: '상태/피드백', termKr: '엠티 스테이트 일러스트', termEn: 'Empty State Illustration', summary: '빈 화면 그림.', detail: '데이터가 없을 때 텍스트만 덜렁 있는 썰렁함을 없애기 위해 넣는 귀여운 그림이나 아이콘입니다. 사용자에게 친근함을 주고 부정적인 경험을 완화합니다.', promptKr: '장바구니가 비었을 때 귀여운 엠티 스테이트 일러스트를 중앙에 넣어줘.', promptEn: 'Insert a cute Empty State Illustration in the center when the cart is empty.', related: [117] },

  // 6. 시각적 스타일 & 비주얼 테크 (Style & Visual Tech)
  { id: 123, category: '스타일/비주얼', termKr: '쓰리 제이에스 / 리액트 쓰리 파이버', termEn: 'Three.js / R3F', summary: '웹 3D 구현 기술.', detail: '웹브라우저에서 별도 프로그램 없이 3D 모델을 보여주고 조작할 수 있게 해주는 기술입니다. 제품을 360도로 돌려보거나 화려한 인터랙티브 웹사이트를 만들 때 씁니다.', promptKr: 'React Three Fiber를 사용하여 태양계 행성을 3D로 렌더링하고, 마우스로 회전할 수 있게 해줘.', promptEn: 'Render the solar system planets in 3D using React Three Fiber and allow mouse rotation.', related: [96] },
  { id: 124, category: '스타일/비주얼', termKr: '3D 파티클 효과', termEn: '3D Particle Effects', summary: '빛 입자 배경 효과.', detail: '수많은 작은 점(입자)들이 공간에 떠다니며 움직이는 몽환적인 효과를 만듭니다. 미래지향적이거나 신비로운 분위기를 연출하고 싶을 때 배경으로 사용합니다.', promptKr: '배경에 반딧불이처럼 은은하게 떠다니는 3D 파티클 효과를 추가해줘.', promptEn: 'Add a 3D Particle Effect to the background that floats gently like fireflies.', related: [97] },
  { id: 125, category: '스타일/비주얼', termKr: '쉐이더 매터리얼', termEn: 'Shader Material', summary: '유동적 질감 표현.', detail: '물결, 불꽃, 액체 금속처럼 표면이 계속 움직이고 변하는 복잡한 질감을 코드로 표현합니다. 정적인 이미지가 줄 수 없는 압도적인 시각 경험을 제공합니다.', promptKr: '물 표면처럼 일렁이는 질감을 표현하기 위해 쉐이더 매터리얼을 적용해줘.', promptEn: 'Apply Shader Material to express a shimmering texture like a water surface.', related: [98] },
  { id: 126, category: '스타일/비주얼', termKr: '스플라인 3D 임베드', termEn: 'Spline 3D Embed', summary: '쉬운 3D 모델 삽입.', detail: '\'Spline\'이라는 3D 디자인 툴로 만든 귀여운 캐릭터나 오브젝트를 웹사이트에 간편하게 가져옵니다. 코딩으로 3D를 짜는 것보다 훨씬 쉽고 빠르게 적용할 수 있습니다.', promptKr: 'Spline에서 만든 귀여운 3D 캐릭터 모델을 화면 중앙에 임베드해줘.', promptEn: 'Embed a cute 3D character model created in Spline into the center of the screen.', related: [123] },
  { id: 127, category: '스타일/비주얼', termKr: '글래스모피즘', termEn: 'Glassmorphism', summary: '반투명 유리 질감.', detail: '배경이 은은하게 비치는 불투명한 유리를 덧댄 듯한 디자인 스타일입니다. 요소 간의 층(Layer)을 명확하게 보여주면서도 세련되고 현대적인 느낌을 줍니다.', promptKr: '카드 배경이 흐릿하게 비치는 반투명한 글래스모피즘 효과를 적용해줘.', promptEn: 'Apply a Glassmorphism effect where the card background looks like frosted glass.', related: [100] },
  { id: 128, category: '스타일/비주얼', termKr: '네오모피즘', termEn: 'Neumorphism', summary: '입체 조각 디자인.', detail: '버튼이나 카드가 배경과 색은 같지만, 빛과 그림자만을 이용해 튀어나오거나 들어간 것처럼 보이게 합니다. 부드럽고 푹신한 플라스틱 같은 독특한 질감을 줍니다.', promptKr: '버튼이 화면에서 부드럽게 튀어나온 듯한 네오모피즘 스타일을 써줘.', promptEn: 'Use Neumorphism style where the button appears to extrude softly from the screen.', related: [101] },
  { id: 129, category: '스타일/비주얼', termKr: '루시드 아이콘', termEn: 'Lucide Icons', summary: '모던 라인 아이콘.', detail: '선 굵기가 일정하고 디자인이 깔끔하여 개발자들 사이에서 표준처럼 쓰이는 아이콘 라이브러리입니다. 어떤 디자인에도 무난하게 잘 어울립니다.', promptKr: '모든 아이콘은 Lucide React 라이브러리의 아이콘으로 통일해서 깔끔하게 해줘.', promptEn: 'Unify all icons using the Lucide React library for a clean look.', related: [102] },
  { id: 130, category: '스타일/비주얼', termKr: '다크 모드', termEn: 'Dark Mode', summary: '어두운 테마 지원.', detail: '밤이나 어두운 곳에서 눈의 피로를 줄이기 위해 배경을 검은색 위주로 바꿉니다. 사용자의 시스템 설정에 맞춰 자동으로 전환되게 하는 것이 기본입니다.', promptKr: '사용자 설정에 따라 자동으로 전환되는 다크 모드를 지원해줘.', promptEn: 'Support Dark Mode that automatically switches based on user settings.', related: [103] },
  { id: 131, category: '스타일/비주얼', termKr: '고대비 모드', termEn: 'High Contrast Mode', summary: '시인성 극대화 모드.', detail: '시력이 좋지 않은 사용자를 위해 색상 차이를 극단적으로 높여 글자와 버튼이 뚜렷하게 보이게 합니다. 접근성을 위한 배려 기능입니다.', promptKr: '시각 약자를 위해 색상 대비가 뚜렷한 고대비 모드 버튼을 추가해줘.', promptEn: 'Add a High Contrast Mode button with distinct color contrast for accessibility.', related: [103] },
  { id: 132, category: '스타일/비주얼', termKr: '그라데이션', termEn: 'Gradient', summary: '색상 혼합 효과.', detail: '두 가지 이상의 색상이 자연스럽게 섞이면서 변하는 효과입니다. 밋밋한 단색 배경이나 버튼에 생동감과 트렌디한 느낌을 더해줍니다.', promptKr: '배경색을 파란색에서 보라색으로 이어지는 그라데이션으로 채워줘.', promptEn: 'Fill the background with a Gradient flowing from blue to purple.', related: [136] },
  { id: 133, category: '스타일/비주얼', termKr: '드롭 섀도우', termEn: 'Drop Shadow', summary: '그림자 입체 효과.', detail: '요소 뒤에 은은한 그림자를 추가하여 마치 바닥에서 떠 있는 듯한 입체감을 줍니다. 요소와 배경을 분리하여 주목도를 높일 때 씁니다.', promptKr: '카드가 떠 있는 것처럼 보이게 부드러운 드롭 섀도우를 추가해줘.', promptEn: 'Add a soft Drop Shadow to make the card look like it\'s floating.', related: [128] },
  { id: 134, category: '스타일/비주얼', termKr: '보더 라디우스', termEn: 'Border Radius', summary: '모서리 둥글기.', detail: '네모난 상자의 모서리를 얼마나 둥글게 깎을지 결정합니다. 값이 클수록 동글동글하고 부드러운 느낌을, 0이면 날카롭고 딱딱한 느낌을 줍니다. ', promptKr: '버튼의 모서리를 완전히 둥글게(알약 모양) 보더 라디우스를 설정해줘.', promptEn: 'Set the Border Radius to make the button corners completely round (pill shape).', related: [12] },
  { id: 135, category: '스타일/비주얼', termKr: '대체 텍스트', termEn: 'Alt Text', summary: '이미지 설명 텍스트.', detail: '시각 장애인을 위한 스크린 리더가 이미지를 읽을 수 있도록 설명을 달아줍니다. 이미지가 로딩되지 않았을 때 대신 표시되기도 하므로 꼭 넣어야 합니다.', promptKr: '모든 이미지에 시각 장애인을 위한 대체 텍스트(Alt Text) 속성을 넣어줘.', promptEn: 'Put Alt Text attributes on all images for screen readers.', related: [131] },
  { id: 136, category: '스타일/비주얼', termKr: '메쉬 그라데이션', termEn: 'Mesh Gradient', summary: '오로라형 배경.', detail: '여러 가지 파스텔 톤 색감이 물감 번지듯 자연스럽게 섞여 있는 배경입니다. 몽환적이고 감성적인 분위기를 낼 때 요즘 가장 많이 쓰는 트렌디한 스타일입니다.', promptKr: '배경에 보라색과 파란색이 섞인 몽환적인 메쉬 그라데이션을 깔아줘.', promptEn: 'Apply a dreamy Mesh Gradient mixing purple and blue for the background.', related: [132] },
  { id: 137, category: '스타일/비주얼', termKr: '블러 효과', termEn: 'Blur Effect', summary: '흐림 처리.', detail: '카메라 초점이 나간 것처럼 요소를 뿌옇게 만듭니다. 민감한 정보를 가리거나, 배경을 흐리게 해서 그 위에 있는 글자를 더 잘 보이게 할 때 씁니다.', promptKr: '유료 회원만 볼 수 있는 콘텐츠는 블러 효과로 흐리게 가려줘.', promptEn: 'Obscure content specifically for paid members using a Blur Effect.', related: [127] },
  { id: 138, category: '스타일/비주얼', termKr: 'SVG 패턴', termEn: 'SVG Pattern', summary: '벡터 반복 무늬.', detail: '점, 선, 기하학적 도형을 배경에 반복해서 깔아주는 무늬입니다. 이미지가 아니라 코드로 그리기 때문에 확대해도 깨지지 않고 용량도 매우 가볍습니다.', promptKr: '배경이 심심하지 않게 은은한 도트 무늬의 SVG 패턴을 깔아줘.', promptEn: 'Lay a subtle dot SVG Pattern so the background isn\'t boring.', related: [136] },
  { id: 139, category: '스타일/비주얼', termKr: '모노스페이스 폰트', termEn: 'Monospace Font', summary: '고정폭 글꼴.', detail: '\'i\'와 \'w\'의 글자 너비가 똑같은, 코딩할 때 쓰는 글씨체입니다. 숫자나 코드를 보여줄 때 줄을 딱딱 맞춰야 하거나 전문적인 느낌을 줄 때 사용합니다.', promptKr: '주문 번호나 코드는 잘 읽히도록 모노스페이스 폰트로 표시해줘.', promptEn: 'Display order numbers or code in a Monospace Font for readability.', related: [173] },
  { id: 140, category: '스타일/비주얼', termKr: '디바이더', termEn: 'Divider', summary: '분할선.', detail: '위아래 내용을 명확하게 나누기 위해 긋는 가로줄입니다. 너무 진하면 시선을 뺏으므로 보통 연한 회색으로 은은하게 처리합니다.', promptKr: '제목과 본문 사이에 얇은 가로줄 디바이더를 넣어 구분을 지어줘.', promptEn: 'Insert a thin horizontal Divider between the title and body.', related: [17] },
  { id: 141, category: '스타일/비주얼', termKr: '오퍼시티', termEn: 'Opacity', summary: '투명도 조절.', detail: '요소가 얼마나 투명한지 결정하는 값입니다. 1은 불투명, 0은 완전 투명입니다. 버튼을 비활성화할 때 흐릿하게 보이게 하려고 투명도를 낮추곤 합니다.', promptKr: '비활성 버튼은 오퍼시티를 0.5로 낮춰서 흐릿하게 보이게 해줘.', promptEn: 'Lower the Opacity to 0.5 for disabled buttons to make them look dim.', related: [137] },

  // 7. 모션 및 인터랙션 (Motion & Interaction)
  { id: 142, category: '모션/인터랙션', termKr: '프레이머 모션', termEn: 'Framer Motion', summary: '리액트 애니메이션 도구.', detail: '리액트 앱에서 요소가 나타나거나 사라질 때 마법처럼 부드러운 움직임을 쉽게 넣어주는 라이브러리입니다. 코드가 직관적이라 복잡한 애니메이션도 쉽게 구현합니다.', promptKr: 'Framer Motion을 사용하여 스크롤 할 때 요소들이 부드럽게 떠오르게 해줘.', promptEn: 'Use Framer Motion to make elements float up smoothly as I scroll down.', related: [109] },
  { id: 143, category: '모션/인터랙션', termKr: '지삽', termEn: 'GSAP', summary: '고성능 웹 애니메이션.', detail: '스크롤 위치에 따라 글자가 춤추거나, 복잡한 순서로 움직이는 화려한 광고 사이트 같은 효과를 만들 때 씁니다. 성능이 매우 뛰어나고 정교한 제어가 가능합니다.', promptKr: 'GSAP를 사용하여 스크롤 위치에 따라 글자가 춤추듯 움직이는 효과를 줘.', promptEn: 'Use GSAP to create an effect where letters dance based on scroll position.', related: [110] },
  { id: 144, category: '모션/인터랙션', termKr: '오토 애니메이트', termEn: 'Auto Animate', summary: '자동 위치 이동 효과.', detail: '리스트의 순서가 바뀌거나 항목이 삭제될 때, 개발자가 일일이 설정하지 않아도 남은 항목들이 스르륵 움직여 자리를 채우게 해주는 마법 같은 도구입니다.', promptKr: '리스트 순서가 바뀔 때 복잡한 설정 없이 자동으로 부드럽게 움직이게 Auto Animate를 적용해줘.', promptEn: 'Apply Auto Animate so the list items move smoothly when reordered without complex setup.', related: [111] },
  { id: 145, category: '모션/인터랙션', termKr: '레니스 스크롤', termEn: 'Lenis Scroll', summary: '고급 관성 스크롤.', detail: '마우스 휠을 굴릴 때 뚝뚝 끊기지 않고, 고급 세단이 미끄러지듯 묵직하고 부드럽게 스크롤 되게 만듭니다. 웹사이트의 경험을 한층 고급스럽게 만들어줍니다.', promptKr: '웹사이트 전체에 Lenis를 적용해서 스크롤 경험을 고급스럽게 만들어줘.', promptEn: 'Apply Lenis to the entire website to make the scrolling experience premium and smooth.', related: [112] },
  { id: 146, category: '모션/인터랙션', termKr: '틸트 효과', termEn: 'Tilt / Vanilla-tilt', summary: '마우스 반응 3D 기울기.', detail: '카드 위에 마우스를 올리면 커서 위치에 따라 카드가 3D로 기울어지며 시선을 따라오는 효과입니다. 요소에 깊이감과 재미를 더해줍니다.', promptKr: '카드에 마우스를 올리면 시점에 따라 기울어지는 3D Tilt 효과를 넣어줘.', promptEn: 'Add a 3D Tilt effect where the card tilts towards the mouse cursor on hover.', related: [113] },
  { id: 147, category: '모션/인터랙션', termKr: '리액트 뷰티풀 디앤디', termEn: 'React Beautiful DnD', summary: '부드러운 드래그 앤 드롭.', detail: '칸반 보드나 리스트에서 항목을 잡아 옮길 때, 다른 항목들이 비켜주거나 자리를 잡는 동작이 매우 자연스러운 라이브러리입니다.', promptKr: '할 일 카드를 마우스로 잡아서 옮길 수 있게 React Beautiful DnD를 적용해줘.', promptEn: 'Apply React Beautiful DnD so users can drag and drop task cards.', related: [114] },
  { id: 148, category: '모션/인터랙션', termKr: '매터 제이에스', termEn: 'Matter.js', summary: '2D 물리 엔진.', detail: '웹 화면에 중력, 마찰력, 충돌 같은 물리 법칙을 적용합니다. 공들이 위에서 떨어져 쌓이거나 서로 부딪혀 튕겨 나가는 게임 같은 효과를 낼 수 있습니다.', promptKr: 'Matter.js를 사용하여 공들이 중력에 의해 떨어지고 서로 부딪혀 튕기는 효과를 구현해줘.', promptEn: 'Implement physics effects where balls fall by gravity and bounce off each other using Matter.js.', related: [115] },
  { id: 149, category: '모션/인터랙션', termKr: '픽시 제이에스', termEn: 'Pixi.js', summary: '고성능 2D 그래픽.', detail: '수천 개의 이미지나 입자를 끊김 없이 동시에 움직이게 할 때 쓰는 엔진입니다. 일반 웹 기술로는 버벅거리는 화려한 효과를 매끄럽게 보여줍니다.', promptKr: 'Pixi.js를 사용하여 수천 개의 별이 동시에 쏟아지는 고성능 애니메이션을 만들어줘.', promptEn: 'Create a high-performance animation with thousands of pouring stars using Pixi.js.', related: [116] },
  { id: 150, category: '모션/인터랙션', termKr: 'P5.js', termEn: 'P5.js', summary: '예술적 코딩 도구.', detail: '코드로 그림을 그리듯 예술적인 패턴이나, 마우스 움직임에 따라 반응하는 인터랙티브 아트를 만들 때 주로 사용합니다.', promptKr: 'P5.js를 사용하여 마우스 움직임에 반응하는 기하학적 예술 패턴을 그려줘.', promptEn: 'Draw a geometric artistic pattern that reacts to mouse movements using P5.js.', related: [117] },

  // --- NEW SECTIONS (Replacing previous 151-200 with new Data/Dev/Tools/Deploy sections) ---
  
  // 9. 데이터와 통신 (Data & Communication)
  { id: 151, category: '데이터/통신', termKr: 'CRUD', termEn: 'CRUD', summary: '데이터 관리 4박자.', detail: 'Create(생성), Read(읽기), Update(수정), Delete(삭제)의 앞 글자를 딴 말로, 게시판 등 대부분의 앱이 갖추어야 할 기본 기능입니다.', promptKr: '게시판에 글을 쓰고, 읽고, 고치고, 지우는 CRUD 기능을 완벽하게 구현해줘.', promptEn: 'Implement full CRUD functionality for the bulletin board.', related: [156] },
  { id: 152, category: '데이터/통신', termKr: 'API', termEn: 'API', summary: '서비스 간 대화 창구.', detail: '식당 점원처럼, 주방(서버)에 주문을 넣고 요리(데이터)를 받아오는 연결 다리 역할을 합니다.', promptKr: '기상청 API를 연결해서 오늘 날씨 정보를 화면에 뿌려줘.', promptEn: 'Connect the Weather API to display today\'s weather on the screen.', related: [158, 161] },
  { id: 153, category: '데이터/통신', termKr: '수파베이스', termEn: 'Supabase', summary: '쉬운 백엔드.', detail: '바이브코딩에서 가장 많이 쓰이는 백엔드 서비스로, 데이터베이스와 구글 로그인 등을 간편하게 붙일 수 있습니다.', promptKr: '백엔드는 Supabase를 연동해서 회원가입과 데이터 저장을 처리해줘.', promptEn: 'Connect Supabase for the backend to handle sign-up and data storage.', related: [157] },
  { id: 154, category: '데이터/통신', termKr: 'JSON', termEn: 'JSON', summary: '데이터 텍스트 포맷.', detail: '사람도 읽기 편하고 컴퓨터도 이해하기 쉬운 가벼운 데이터 포맷으로, 대부분의 데이터 교환에 쓰입니다.', promptKr: '학생 명단 데이터를 JSON 형식의 가데이터로 10개만 만들어줘.', promptEn: 'Generate 10 dummy data entries for the student list in JSON format.', related: [169] },
  { id: 155, category: '데이터/통신', termKr: '로컬 스토리지', termEn: 'Local Storage', summary: '브라우저 저장소.', detail: '서버까지 가지 않고 사용자의 브라우저 내부에 간단한 설정(예: 다크모드 여부)을 저장할 때 씁니다.', promptKr: '새로고침 해도 메모가 지워지지 않게 로컬 스토리지에 저장해줘.', promptEn: 'Save the memo to Local Storage so it doesn\'t vanish on refresh.', related: [165] },
  { id: 156, category: '데이터/통신', termKr: '쿼리', termEn: 'Query', summary: '데이터 요청 질문.', detail: '수많은 데이터 중에서 내가 원하는 조건(예: \'김씨 성을 가진 학생\')에 맞는 것만 쏙 골라내는 명령어입니다.', promptKr: '점수가 80점 이상인 학생만 뽑아오도록 쿼리를 작성해줘.', promptEn: 'Write a Query to fetch only students with scores above 80.', related: [151] },
  { id: 157, category: '데이터/통신', termKr: '스키마', termEn: 'Schema', summary: '데이터 설계도.', detail: '데이터가 뒤죽박죽 저장되지 않도록 미리 정해놓은 구조와 형식을 말합니다.', promptKr: '회원 정보를 저장할 데이터베이스 스키마를 설계해줘.', promptEn: 'Design the database schema for storing user information.', related: [153] },
  { id: 158, category: '데이터/통신', termKr: '엔드포인트', termEn: 'Endpoint', summary: 'API 주소.', detail: 'API가 문이라면, 엔드포인트는 그 문의 구체적인 주소(예: `/users/login`)입니다.', promptKr: '로그인을 처리하는 API 엔드포인트 주소를 알려줘.', promptEn: 'Tell me the API Endpoint URL that handles user login.', related: [152] },
  { id: 159, category: '데이터/통신', termKr: '파라미터', termEn: 'Parameter', summary: '함수 옵션 값.', detail: '검색 API를 호출할 때 "검색어=사과"에서 \'사과\'가 바로 파라미터입니다.', promptKr: '검색어 파라미터를 URL에 포함해서 API를 호출해줘.', promptEn: 'Call the API by including the search term Parameter in the URL.', related: [158] },
  { id: 160, category: '데이터/통신', termKr: '비동기 처리', termEn: 'Async/Await', summary: '기다림 없는 처리.', detail: '"데이터 가져와(Async)" 시키고 "올 때까지 기다려(Await)" 하는 동안, 사용자는 스크롤을 내릴 수 있게 합니다.', promptKr: '데이터를 불러오는 동안 화면이 멈추지 않게 비동기 처리를 해줘.', promptEn: 'Use Async/Await so the screen doesn\'t freeze while fetching data.', related: [177] },
  { id: 161, category: '데이터/통신', termKr: 'REST API', termEn: 'REST API', summary: '주소 규칙.', detail: '`GET /users`(조회), `POST /users`(생성) 처럼 명령어와 주소를 명확하게 나누는 약속입니다.', promptKr: '사용자 정보를 관리하는 주소를 REST API 규칙에 맞게 설계해줘.', promptEn: 'Design the URL for managing user info according to REST API rules.', related: [152] },
  { id: 162, category: '데이터/통신', termKr: '웹훅', termEn: 'Webhook', summary: '자동 알림.', detail: '"결제 완료되면 내 서버로 알려줘"처럼, 계속 확인하지 않아도 알아서 신호를 보내줍니다.', promptKr: '결제가 완료되면 웹훅을 받아서 주문 상태를 \'완료\'로 바꿔줘.', promptEn: 'Receive a Webhook upon payment completion and change order status to \'Done\'.', related: [152] },

  // 10. 개발 개념 및 구조 (Development Concepts)
  { id: 163, category: '개발/개념', termKr: '컴포넌트', termEn: 'Component', summary: 'UI 레고 블록.', detail: '버튼, 카드, 헤더 등을 각각 하나의 부품(컴포넌트)으로 만들어 조립하면 관리가 쉽습니다.', promptKr: '이 버튼은 여러 곳에서 쓰니까 재사용 가능한 컴포넌트로 분리해줘.', promptEn: 'Separate this button into a reusable Component since it\'s used everywhere.', related: [13] },
  { id: 164, category: '개발/개념', termKr: '프롭스', termEn: 'Props', summary: '부모가 주는 데이터.', detail: '같은 버튼이라도 Props로 \'저장\', \'취소\' 텍스트를 다르게 주면 다른 모양으로 쓸 수 있습니다.', promptKr: '버튼 색상을 Props로 전달받아서 바꿀 수 있게 해줘.', promptEn: 'Allow changing the button color by passing it as Props.', related: [163] },
  { id: 165, category: '개발/개념', termKr: '스테이트', termEn: 'State', summary: '현재 상태 값.', detail: '\'카운트 숫자\', \'입력창의 글자\', \'모달이 열림/닫힘\' 등 사용자의 행동에 따라 바뀌는 데이터를 말합니다.', promptKr: '좋아요 버튼을 눌렀는지 안 눌렀는지 상태(State)를 관리해줘.', promptEn: 'Manage the State of whether the like button is pressed or not.', related: [166] },
  { id: 166, category: '개발/개념', termKr: '훅', termEn: 'Hook', summary: '리액트 기능 도구.', detail: '`useState`(상태 관리), `useEffect`(데이터 불러오기) 처럼 `use`로 시작하는 함수들을 말합니다.', promptKr: 'useEffect 훅을 사용해서 페이지가 열리자마자 데이터를 불러오게 해줘.', promptEn: 'Use the useEffect Hook to fetch data as soon as the page opens.', related: [165] },
  { id: 167, category: '개발/개념', termKr: '리팩토링', termEn: 'Refactoring', summary: '코드 대청소.', detail: '코드가 지저분하면 나중에 고치기 힘들기 때문에, 정리 정돈하는 과정입니다.', promptKr: '기능은 그대로 두고, 코드를 좀 더 읽기 좋게 리팩토링해줘.', promptEn: 'Refactor the code to make it more readable while keeping the features intact.', related: [163] },
  { id: 168, category: '개발/개념', termKr: '하드코딩', termEn: 'Hard Coding', summary: '값 고정.', detail: '"안녕하세요"를 코드에 직접 쓰면 나중에 수정하기 힘드니 피해야 할 방식입니다.', promptKr: '메뉴 이름을 하드코딩하지 말고 데이터 배열에서 불러오도록 수정해줘.', promptEn: 'Don\'t hardcode the menu names; fetch them from a data array.', related: [154] },
  { id: 169, category: '개발/개념', termKr: '더미 데이터', termEn: 'Dummy Data', summary: '임시 가짜 데이터.', detail: '개발 초기에에는 실제 글이 없으니, \'제목1\', \'내용1\' 같은 임시 데이터를 넣어 화면을 확인합니다.', promptKr: '디자인 확인을 위해 게시글 목 데이터 5개를 만들어서 보여줘.', promptEn: 'Create 5 dummy data entries for posts to verify the design.', related: [154] },
  { id: 170, category: '개발/개념', termKr: '라이브러리', termEn: 'Library', summary: '유용한 도구 모음.', detail: '차트, 지도, 달력 같은 기능을 처음부터 다 만들지 않고 라이브러리를 가져와서 씁니다.', promptKr: '달력 기능은 직접 만들지 말고 라이브러리를 사용해서 구현해줘.', promptEn: 'Implement the calendar using a Library instead of building it from scratch.', related: [176] },
  { id: 171, category: '개발/개념', termKr: '프레임워크', termEn: 'Framework', summary: '개발 뼈대.', detail: '라이브러리가 \'부품\'이라면, 프레임워크는 \'집 짓는 키트\' 전체를 말합니다.', promptKr: '이번 프로젝트는 Next.js 프레임워크를 사용해서 구축해줘.', promptEn: 'Build this project using the Next.js Framework.', related: [170] },
  { id: 172, category: '개발/개념', termKr: '라우팅', termEn: 'Routing', summary: '페이지 이동 경로.', detail: '사용자가 요청한 주소(URL)에 따라 알맞은 페이지를 보여주는 교통정리입니다. `/about`을 치면 소개 페이지로, `/login`을 치면 로그인 페이지로 보내주는 역할입니다.', promptKr: '메뉴를 누르면 해당 페이지로 이동하도록 라우팅을 설정해줘.', promptEn: 'Setup Routing so clicking the menu navigates to the corresponding page.', related: [1] },
  { id: 173, category: '개발/개념', termKr: '서버 사이드 렌더링', termEn: 'SSR', summary: '서버 완성 화면.', detail: '서버에서 미리 화면을 다 그려서 보내주는 방식입니다. 검색 엔진(SEO)에 유리하고 초기 로딩이 빠르지만, 서버에 부하가 갈 수 있습니다.', promptKr: '검색 노출이 잘 되도록 메인 페이지는 SSR 방식으로 렌더링해줘.', promptEn: 'Render the main page using SSR for better search engine exposure.', related: [174] },
  { id: 174, category: '개발/개념', termKr: '클라이언트 사이드 렌더링', termEn: 'CSR', summary: '브라우저 조립 화면.', detail: '브라우저(사용자 컴퓨터)에서 화면을 그리는 방식입니다. 앱처럼 부드럽게 작동하지만, 첫 화면이 뜨는 데 시간이 조금 걸릴 수 있습니다.', promptKr: '화면 전환이 부드럽게 CSR 방식으로 대시보드를 만들어줘.', promptEn: 'Build the dashboard using CSR for smooth page transitions.', related: [173] },
  { id: 175, category: '개발/개념', termKr: '전역 상태', termEn: 'Global State', summary: '공유 데이터.', detail: '\'로그인 정보\'나 \'테마 설정\'처럼 앱의 모든 곳에서 다 같이 쓰는 데이터입니다. 여러 페이지에서 공통으로 필요한 데이터를 한곳에서 관리하는 방법입니다.', promptKr: '로그인 사용자 정보는 전역 상태로 관리해서 어디서든 접근할 수 있게 해줘.', promptEn: 'Manage user login info as Global State so it can be accessed from anywhere.', related: [178] },

  // 11. 도구 및 라이브러리 (Tools & Libraries)
  { id: 176, category: '도구/라이브러리', termKr: '리차트', termEn: 'Recharts', summary: '리액트 차트.', detail: '커스터마이징이 쉽고 참고할 예제가 많아 그래프를 그릴 때 기본적으로 추천됩니다.', promptKr: 'Recharts 라이브러리를 사용해서 깔끔한 막대그래프를 그려줘.', promptEn: 'Draw a clean bar chart using the Recharts library.', related: [59] },
  { id: 177, category: '도구/라이브러리', termKr: '리액트 쿼리', termEn: 'React Query', summary: '데이터 가져오기 도구.', detail: '로딩 중, 에러 발생, 데이터 캐싱 등을 자동으로 처리해 주어 코드가 매우 깔끔해집니다.', promptKr: '데이터를 불러올 때 로딩 처리를 쉽게 하기 위해 React Query를 사용해줘.', promptEn: 'Use React Query to easily handle loading states when fetching data.', related: [160] },
  { id: 178, category: '도구/라이브러리', termKr: '주스탄드', termEn: 'Zustand', summary: '쉬운 전역 상태.', detail: '복잡한 설정 없이, 앱 전체에서 공유해야 할 변수를 만들 때 가장 많이 추천됩니다.', promptKr: '복잡한 도구 대신 가벼운 Zustand를 써서 장바구니 기능을 만들어줘.', promptEn: 'Use lightweight Zustand instead of complex tools to create the cart feature.', related: [175] },
  { id: 179, category: '도구/라이브러리', termKr: '시엔', termEn: 'cn (clsx)', summary: '조건부 스타일.', detail: '"활성 상태면 파란색, 아니면 회색" 같은 조건부 디자인을 테일윈드와 함께 쓸 때 필수입니다.', promptKr: '조건부 스타일링이 편하도록 `cn` 유틸리티 함수를 설정해줘.', promptEn: 'Setup the `cn` utility function to make conditional styling easier.', related: [12] },
  { id: 180, category: '도구/라이브러리', termKr: '루시드 아이콘', termEn: 'Lucide React', summary: '표준 아이콘.', detail: '별도의 설정 없이 바로 가져다 쓸 수 있는 예쁜 아이콘 라이브러리입니다.', promptKr: '모든 아이콘은 Lucide React 라이브러리를 써서 통일감을 줘.', promptEn: 'Use the Lucide React library for all icons to ensure consistency.', related: [129] },
  { id: 181, category: '도구/라이브러리', termKr: '엑시오스', termEn: 'Axios', summary: '데이터 배달부.', detail: '서버와 통신할 때 데이터를 자동으로 변환해 주는 등 편리한 기능이 많아 자주 씁니다.', promptKr: '서버 통신에는 fetch 대신 Axios를 사용해서 코드를 간결하게 해줘.', promptEn: 'Use Axios instead of fetch for server communication to keep the code clean.', related: [152] },
  { id: 182, category: '도구/라이브러리', termKr: '넥스트 어스', termEn: 'NextAuth', summary: '쉬운 로그인.', detail: '구글, 카카오 로그인 등을 복잡한 코드 없이 빠르게 붙일 때 사용합니다.', promptKr: 'NextAuth를 사용해서 구글 소셜 로그인을 빠르게 구현해줘.', promptEn: 'Quickly implement Google social login using NextAuth.', related: [153] },
  { id: 183, category: '도구/라이브러리', termKr: '테일윈드 머지', termEn: 'Tailwind Merge', summary: '스타일 충돌 방지.', detail: '\'배경 빨강\'과 \'배경 파랑\'이 겹치면, 나중에 쓴 \'파랑\'이 적용되도록 정리해 줍니다.', promptKr: '스타일 충돌을 막기 위해 Tailwind Merge를 적용해줘.', promptEn: 'Apply Tailwind Merge to prevent style conflicts.', related: [12] },
  { id: 184, category: '도구/라이브러리', termKr: '데이리에프엔에스', termEn: 'date-fns', summary: '날짜 계산기.', detail: '"오늘부터 3일 뒤", "2024년 1월 1일은 무슨 요일?" 같은 계산을 쉽게 처리합니다.', promptKr: '날짜 포맷 변경은 date-fns 라이브러리를 사용해서 처리해줘.', promptEn: 'Handle date formatting using the date-fns library.', related: [48] },
  { id: 185, category: '도구/라이브러리', termKr: '폼익', termEn: 'Formik', summary: '입력폼 관리.', detail: 'React Hook Form과 비슷하지만, 전통적으로 많이 쓰이는 입력폼 관리 라이브러리입니다.', promptKr: '회원가입 폼의 유효성 검사를 위해 Formik을 사용해줘.', promptEn: 'Use Formik for validation of the sign-up form.', related: [39] },
  { id: 186, category: '도구/라이브러리', termKr: '스토리북', termEn: 'Storybook', summary: 'UI 도감.', detail: '앱을 실행하지 않고도 버튼, 카드 등의 모양만 따로 떼어서 확인하고 관리할 수 있습니다.', promptKr: '모든 UI 컴포넌트를 스토리북에 등록해서 디자인을 점검하게 해줘.', promptEn: 'Register all UI components to Storybook to inspect the design.', related: [163] },
  { id: 187, category: '도구/라이브러리', termKr: '프리티어', termEn: 'Prettier', summary: '코드 정렬.', detail: '개발자의 필수품으로, 개떡같이 짜도 찰떡같이 정리해 줍니다.', promptKr: '저장할 때마다 Prettier가 작동해서 코드를 자동으로 정렬해 주게 설정해줘.', promptEn: 'Configure Prettier to automatically format the code on save.', related: [167] },
  { id: 188, category: '도구/라이브러리', termKr: '린터', termEn: 'ESLint', summary: '코드 검사관.', detail: '빨간 줄을 그어주어 버그를 미리 막고 코드를 규칙에 맞게 쓰도록 돕습니다.', promptKr: '코드가 지저분해지지 않게 엄격한 ESLint 규칙을 적용해줘.', promptEn: 'Apply strict ESLint rules to prevent the code from getting messy.', related: [167] },

  // 12. 배포 및 운영 (Deployment & Ops)
  { id: 189, category: '배포/운영', termKr: '버셀', termEn: 'Vercel', summary: '무료 호스팅.', detail: '클릭 몇 번으로 배포가 가능하며, 속도가 빠르고 바이브코딩 툴들과 호환성이 최고입니다.', promptKr: '완성된 프로젝트를 Vercel에 배포할 수 있도록 설정해줘.', promptEn: 'Configure the project so it can be deployed to Vercel.', related: [190] },
  { id: 190, category: '배포/운영', termKr: '배포', termEn: 'Deploy', summary: '출시하기.', detail: '"배포한다"는 것은 곧 "출시한다"는 의미와 같습니다.', promptKr: '수정 사항을 반영해서 라이브 서버에 다시 배포해줘.', promptEn: 'Deploy the changes to the live server again.', related: [189] },
  { id: 191, category: '배포/운영', termKr: '빌드', termEn: 'Build', summary: '실행 파일 변환.', detail: '배포하기 직전에 하는 포장 작업으로, 이때 에러가 없어야 배포가 됩니다.', promptKr: '배포 전에 에러가 없는지 빌드(Build) 테스트를 먼저 해줘.', promptEn: 'Run a Build test to check for errors before deployment.', related: [190] },
  { id: 192, category: '배포/운영', termKr: '환경 변수', termEn: 'Environment Variables', summary: '비밀 정보 금고.', detail: '코드에 직접 비밀번호를 적으면 해킹 위험이 있으므로, `.env` 파일에 넣어 따로 관리합니다.', promptKr: 'API 키는 코드에 쓰지 말고 환경 변수(.env)로 분리해서 관리해줘.', promptEn: 'Manage the API key using environment variables (.env) instead of hardcoding it.', related: [168] },
  { id: 193, category: '배포/운영', termKr: 'SEO', termEn: 'SEO', summary: '검색 엔진 최적화.', detail: '검색 로봇이 내 사이트를 잘 이해할 수 있도록 제목, 설명, 태그 등을 잘 정리하는 것입니다.', promptKr: '구글 검색에 잘 걸리도록 메타 태그를 포함한 SEO 설정을 해줘.', promptEn: 'Configure SEO settings including meta tags to rank well on Google.', related: [173] },
  { id: 194, category: '배포/운영', termKr: '오픈 그래프', termEn: 'Open Graph', summary: 'SNS 공유 미리보기.', detail: '이게 없으면 링크만 덜렁 떠서 클릭하고 싶지 않게 보입니다.', promptKr: '카톡 공유 시 썸네일이 잘 나오도록 오픈 그래프 태그를 설정해줘.', promptEn: 'Set up Open Graph tags so the thumbnail appears when shared on KakaoTalk.', related: [193] },
  { id: 195, category: '배포/운영', termKr: '파비콘', termEn: 'Favicon', summary: '탭 아이콘.', detail: '사이트의 정체성을 나타내는 작은 로고로, 즐겨찾기 할 때도 보입니다.', promptKr: '학교 로고를 사용해서 브라우저 탭에 뜰 파비콘을 적용해줘.', promptEn: 'Apply a Favicon to the browser tab using the school logo.', related: [129] },
  { id: 196, category: '배포/운영', termKr: 'PWA', termEn: 'PWA', summary: '웹앱 설치 기술.', detail: '모바일 홈 화면에 아이콘을 추가할 수 있고, 푸시 알림도 보낼 수 있습니다.', promptKr: '이 웹사이트를 모바일 앱처럼 설치할 수 있게 PWA로 만들어줘.', promptEn: 'Make this website a PWA so it can be installed like a mobile app.', related: [189] },
  { id: 197, category: '배포/운영', termKr: '도메인', termEn: 'Domain', summary: '인터넷 주소.', detail: 'IP 주소(숫자) 대신 사람이 기억하기 쉬운 문자로 된 주소를 연결하는 것입니다.', promptKr: '내가 구입한 커스텀 도메인을 배포한 사이트에 연결해줘.', promptEn: 'Connect the custom domain I purchased to the deployed site.', related: [189] },
  { id: 198, category: '배포/운영', termKr: '깃/깃허브', termEn: 'Git/GitHub', summary: '코드 저장소.', detail: '코드를 망쳐도 언제든 과거로 되돌릴 수 있고, 협업할 때 필수입니다.', promptKr: '작업 내용을 깃허브 리포지토리에 커밋하고 푸시해줘.', promptEn: 'Commit the changes and push them to the GitHub repository.', related: [190] },
  { id: 199, category: '배포/운영', termKr: '이슈', termEn: 'Issue', summary: '할 일/버그 게시판.', detail: '프로젝트에서 해결해야 할 문제점 하나하나를 이슈라고 부릅니다.', promptKr: '발견된 버그는 깃허브 이슈로 등록해서 관리해줘.', promptEn: 'Register found bugs as GitHub Issues for management.', related: [198] },
  { id: 200, category: '배포/운영', termKr: '리드미', termEn: 'README.md', summary: '프로젝트 설명서.', detail: '깃허브에 들어갔을 때 가장 먼저 보이는 문서로, "이 프로젝트는 뭐고 어떻게 실행한다"를 적습니다.', promptKr: '다른 사람이 프로젝트를 쉽게 이해하도록 상세한 리드미 파일을 작성해줘.', promptEn: 'Write a detailed README file so others can easily understand the project.', related: [198] },
];

// --- 🎯 정밀한 시각적 프리뷰 컴포넌트 (200개 전수 대응) ---
const VisualPreview: React.FC<{ term: Term }> = ({ term }) => {
  const { id } = term;

  // 1. Navbar
  if (id === 1) return <div className="w-full h-full bg-slate-50 relative"><div className="absolute top-0 w-full h-6 bg-blue-500 flex items-center px-2 justify-between shadow-sm"><div className="w-4 h-2 bg-white/50 rounded"></div><div className="flex gap-1"><div className="w-3 h-1 bg-white/50 rounded"></div><div className="w-3 h-1 bg-white/50 rounded"></div></div></div></div>;
  if (id === 2) return <div className="w-full h-full bg-slate-50 flex"><div className="w-1/3 h-full bg-blue-100 border-r border-blue-200 p-1 flex flex-col gap-1"><div className="w-full h-2 bg-blue-400 rounded"></div><div className="w-full h-1 bg-blue-300 rounded"></div><div className="w-full h-1 bg-blue-300 rounded"></div></div><div className="flex-1"></div></div>;
  if (id === 3) return <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-2"><div className="w-16 h-2 bg-white/80 rounded mb-1"></div><div className="w-8 h-3 bg-white/30 rounded-full shadow-sm mt-1"></div></div>;
  if (id === 4) return <div className="w-full h-full bg-slate-50 flex flex-col justify-end"><div className="w-full h-6 bg-slate-700 flex items-center justify-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div><div className="w-2 h-2 rounded-full bg-slate-500"></div><div className="w-2 h-2 rounded-full bg-slate-500"></div></div></div>;
  if (id === 5) return <div className="w-full h-full bg-slate-50 overflow-hidden relative"><div className="w-full h-6 bg-blue-500 absolute top-0 z-10 shadow-md"></div><div className="w-full h-full p-2 pt-8 space-y-2"><div className="w-full h-2 bg-slate-200 rounded"></div><div className="w-full h-2 bg-slate-200 rounded"></div><div className="w-full h-2 bg-slate-200 rounded"></div><div className="w-full h-2 bg-slate-200 rounded"></div></div></div>;
  if (id === 6) return <div className="w-full h-full bg-slate-50 relative flex flex-col"><div className="flex-1 p-2"><div className="w-full h-2 bg-slate-200 rounded"></div></div><div className="w-full h-6 bg-slate-800 absolute bottom-0"></div></div>;
  if (id === 7) return <div className="w-full h-full bg-slate-50 p-2 grid grid-cols-2 gap-1"><div className="bg-blue-200 rounded h-full"></div><div className="bg-blue-200 rounded h-full"></div><div className="bg-blue-200 rounded h-full"></div><div className="bg-blue-200 rounded h-full"></div></div>;
  if (id === 8) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-4 h-8 bg-blue-200 rounded border border-blue-300"></div><div className="w-8 h-8 bg-blue-300 rounded border border-blue-400"></div><div className="w-12 h-8 bg-blue-400 rounded border border-blue-500"></div></div>;
  if (id === 9) return <div className="w-full h-full bg-slate-200 flex items-center justify-center"><div className="w-2/3 h-2/3 bg-white border-2 border-dashed border-blue-300 shadow-sm flex items-center justify-center text-[6px] text-blue-300">Container</div></div>;
  if (id === 10) return <div className="w-full h-full bg-slate-50 p-2 columns-2 gap-1"><div className="bg-blue-200 rounded h-8 mb-1 w-full"></div><div className="bg-blue-300 rounded h-12 mb-1 w-full"></div><div className="bg-blue-400 rounded h-6 mb-1 w-full"></div></div>;
  if (id === 11) return <div className="w-full h-full bg-slate-50 p-2 grid grid-cols-3 grid-rows-3 gap-1"><div className="bg-blue-200 rounded col-span-2 row-span-2"></div><div className="bg-blue-300 rounded"></div><div className="bg-blue-400 rounded row-span-1"></div></div>;
  if (id === 12) return <div className="w-full h-full bg-slate-900 flex items-center justify-center p-2"><div className="text-[6px] text-sky-400 font-mono">class="flex<br/>p-4 bg-sky"</div></div>;
  if (id === 13) return <div className="w-full h-full bg-slate-50 flex flex-col gap-2 items-center justify-center"><div className="w-16 h-4 bg-slate-900 rounded text-white text-[6px] flex items-center justify-center shadow-sm">Button</div><div className="w-16 h-4 border border-slate-300 rounded bg-white shadow-sm"></div></div>;
  if (id === 14) return <div className="w-full h-full bg-slate-200 relative overflow-hidden"><div className="absolute right-0 top-0 h-full w-1/2 bg-white shadow-lg border-l border-slate-300"></div></div>;
  if (id === 15) return <div className="w-full h-full bg-slate-200 relative overflow-hidden"><div className="absolute bottom-0 w-full h-1/2 bg-white rounded-t-lg shadow-lg border-t border-slate-300"></div></div>;
  if (id === 16) return <div className="w-full h-full bg-slate-100 flex items-center justify-center"><div className="w-16 h-20 bg-white rounded shadow-md border border-slate-100 p-1 flex flex-col gap-1"><div className="w-full h-8 bg-blue-100 rounded"></div><div className="w-full h-2 bg-slate-100 rounded"></div></div></div>;
  if (id === 17) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center gap-2 p-2"><div className="w-full h-4 bg-white border border-slate-100 rounded"></div><div className="w-full h-px bg-slate-300"></div><div className="w-full h-4 bg-white border border-slate-100 rounded"></div></div>;
  if (id === 18) return <div className="w-full h-full bg-slate-50 flex flex-col justify-between p-3"><div className="w-full h-4 bg-blue-100 border border-blue-200 rounded"></div><div className="w-full h-4 bg-blue-100 border border-blue-200 rounded"></div></div>;
  if (id === 19) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><div className="absolute w-10 h-10 bg-blue-300 rounded top-3 left-6 z-0 border border-white"></div><div className="absolute w-10 h-10 bg-blue-500 rounded top-5 left-10 z-10 shadow-lg border border-white"></div></div>;
  if (id === 20) return <div className="w-full h-full bg-slate-900 rounded-xl border-4 border-slate-700 flex flex-col relative overflow-hidden"><div className="w-full h-4 bg-red-500/30 absolute top-0 flex items-center justify-center"><span className="text-[6px] text-white">Safe</span></div><div className="w-12 h-3 bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-lg"></div></div>;
  
  if (id === 21) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2"><div className="flex gap-1"><div className="w-4 h-4 bg-blue-200 rounded"></div><div className="w-4 h-4 bg-blue-200 rounded"></div></div></div>;
  if (id === 22) return <div className="w-full h-full bg-slate-50 flex"><div className="w-1/2 bg-blue-50 border-r border-blue-200"></div><div className="w-1/2 bg-white"></div></div>;
  if (id === 23) return <div className="w-full h-full bg-slate-50 border-4 border-blue-300 rounded-lg flex items-center justify-center text-[8px] text-blue-400">100vh</div>;
  if (id === 24) return <div className="w-full h-full bg-slate-50 flex gap-2 p-2 justify-center"><div className="w-6 h-full bg-blue-100"></div><div className="w-2 h-full bg-red-100/50"></div><div className="w-6 h-full bg-blue-100"></div></div>;
  if (id === 25) return <div className="w-full h-full relative"><img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&q=80" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[8px]">Overlay</div></div>;
  if (id === 26) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-px h-full bg-red-400 dashed"></div><span className="text-[6px] text-red-500 bg-white px-1">768px</span></div>;

  // 2. Navigation
  if (id === 27) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="flex flex-col gap-1"><div className="w-6 h-0.5 bg-indigo-600 rounded"></div><div className="w-6 h-0.5 bg-indigo-600 rounded"></div><div className="w-6 h-0.5 bg-indigo-600 rounded"></div></div></div>;
  if (id === 28) return <div className="w-full h-full bg-slate-50 flex flex-col"><div className="flex w-full h-8 border-b border-indigo-200"><div className="flex-1 bg-indigo-50 border-b-2 border-indigo-500 text-indigo-500 flex items-center justify-center text-[6px]">Tab 1</div><div className="flex-1 bg-white text-slate-400 flex items-center justify-center text-[6px]">Tab 2</div></div><div className="flex-1 bg-slate-50 p-2"></div></div>;
  if (id === 29) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="flex gap-1 text-[8px] text-slate-400"><span>Home</span><span className="text-slate-300">/</span><span>Page</span><span className="text-slate-300">/</span><span className="font-bold text-indigo-600">Current</span></div></div>;
  if (id === 30) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">1</div><div className="w-5 h-5 bg-indigo-500 text-white rounded flex items-center justify-center text-[8px] shadow-sm">2</div><div className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">3</div></div>;
  if (id === 31) return <div className="w-full h-full bg-slate-50 p-2 space-y-1 overflow-hidden relative"><div className="w-full h-4 bg-indigo-100 rounded"></div><div className="w-full h-4 bg-indigo-100 rounded"></div><div className="w-full h-4 bg-indigo-100 rounded"></div><div className="w-full h-4 bg-indigo-100/50 rounded animate-pulse"></div><div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-slate-50 to-transparent"></div></div>;
  if (id === 32) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-0"><div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[6px] text-white z-10">1</div><div className="w-6 h-0.5 bg-indigo-500"></div><div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-indigo-100 z-10"></div></div>;
  if (id === 33) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="px-2 py-1 border-2 border-indigo-500 ring-2 ring-indigo-200 rounded bg-white text-[8px] text-indigo-700 font-bold">Focus</div></div>;
  if (id === 34) return <div className="w-full h-full bg-slate-100 flex overflow-hidden relative"><div className="w-full h-full bg-white absolute shadow-lg transform translate-x-4"></div><div className="w-full h-full bg-indigo-50 absolute shadow-lg transform -translate-x-full opacity-50"></div></div>;
  if (id === 35) return <div className="w-full h-full bg-slate-50 flex"><div className="w-1/3 h-full bg-slate-100 p-2 space-y-1 border-r border-slate-200"><div className="w-full h-1 bg-slate-300"></div><div className="w-full h-1 bg-indigo-500 w-3/4"></div><div className="w-full h-1 bg-slate-300"></div></div><div className="flex-1 p-2"><div className="w-full h-2 bg-slate-200 mb-6"></div><div className="w-full h-2 bg-indigo-200 mb-6"></div></div></div>;
  if (id === 36) return <div className="w-full h-full bg-slate-50 relative"><div className="w-full h-6 bg-white border-b border-slate-200 flex items-center px-2"><div className="w-10 h-2 bg-indigo-200 rounded"></div></div><div className="absolute top-6 left-0 w-full h-20 bg-white shadow-md grid grid-cols-3 gap-2 p-2"><div className="bg-indigo-50 rounded"></div><div className="bg-indigo-50 rounded"></div><div className="bg-indigo-50 rounded"></div></div></div>;
  if (id === 37) return <div className="w-full h-full bg-slate-100 relative"><div className="absolute bottom-3 right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white"><ArrowUp size={14} /></div></div>;
  if (id === 38) return <div className="w-full h-full bg-black/20 relative"><div className="absolute bottom-2 left-2 right-2 bg-white rounded-xl p-2 space-y-1 shadow-lg"><div className="w-full h-4 bg-slate-100 rounded"></div><div className="w-full h-4 bg-slate-100 rounded"></div><div className="w-full h-4 bg-red-50 rounded"></div></div></div>;
  if (id === 39) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="text-[8px] text-indigo-500 underline decoration-indigo-300">#section-1</div></div>;
  if (id === 40) return <div className="w-full h-full bg-slate-50 flex items-end justify-end p-2"><div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">+</div></div>;
  if (id === 41) return <div className="w-full h-full bg-slate-50 flex overflow-hidden"><div className="w-1/2 bg-white border-r border-slate-200 shadow-xl z-10"></div><div className="w-1/2 bg-slate-100"></div></div>;
  if (id === 42) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="bg-black text-white px-2 py-1 rounded text-[8px]">Skip to Content</div></div>;

  // 3. Input
  if (id === 43) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full h-8 border border-slate-300 rounded flex items-center px-2 bg-white"><span className="text-[8px] text-slate-300">Type something...</span></div></div>;
  if (id === 44) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center p-2"><span className="text-[8px] text-rose-600 font-bold mb-0.5">Email</span><div className="w-full h-6 border border-slate-300 rounded bg-white"></div></div>;
  if (id === 45) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full h-8 border border-rose-400 rounded relative bg-white"><span className="absolute -top-1.5 left-2 bg-white px-1 text-[6px] text-rose-500 font-medium">Username</span></div></div>;
  if (id === 46) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center p-2"><div className="w-full h-6 border border-slate-300 rounded mb-0.5 bg-white"></div><span className="text-[6px] text-slate-400 flex items-center gap-0.5"><div className="w-1 h-1 bg-slate-400 rounded-full"></div>Min 8 chars</span></div>;
  if (id === 47) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center p-2"><div className="w-full h-7 border-2 border-red-400 rounded bg-red-50 flex items-center px-2 justify-between"><span className="text-[6px] text-red-500">Invalid!</span><div className="w-2 h-2 bg-red-500 rounded-full text-white flex items-center justify-center text-[4px]">!</div></div></div>;
  if (id === 48) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full h-8 border border-slate-300 rounded flex items-center justify-center text-[10px] tracking-widest text-slate-400 font-mono bg-white">010 - ____</div></div>;
  if (id === 49) return <div className="w-full h-full bg-slate-50 flex flex-col gap-1.5 p-3"><div className="w-full h-2 border border-slate-200 rounded bg-white"></div><div className="w-full h-2 border border-slate-200 rounded bg-white"></div><div className="w-1/3 h-4 bg-rose-500 rounded self-end"></div></div>;
  if (id === 50) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 bg-rose-500 rounded flex items-center justify-center text-white text-[8px] shadow-sm">✓</div><div className="w-10 h-2 bg-slate-200 rounded"></div></div><div className="flex items-center gap-1.5 opacity-50"><div className="w-4 h-4 border-2 border-slate-300 rounded bg-white"></div><div className="w-10 h-2 bg-slate-200 rounded"></div></div></div>;
  if (id === 51) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 border-4 border-rose-500 rounded-full bg-white shadow-sm"></div><div className="w-10 h-2 bg-slate-200 rounded"></div></div><div className="flex items-center gap-1.5 opacity-50"><div className="w-4 h-4 border-2 border-slate-300 rounded-full bg-white"></div><div className="w-10 h-2 bg-slate-200 rounded"></div></div></div>;
  if (id === 52) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-6 bg-rose-500 rounded-full p-0.5 shadow-inner"><div className="w-5 h-5 bg-white rounded-full translate-x-6 shadow-md border border-slate-100"></div></div></div>;
  if (id === 53) return <div className="w-full h-full bg-slate-50 flex items-center justify-center px-4"><div className="w-full h-1.5 bg-slate-200 rounded-full relative"><div className="w-2/3 h-full bg-rose-500 rounded-full"></div><div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-rose-200 rounded-full shadow-md"></div></div></div>;
  if (id === 54) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-2"><div className="w-full h-7 border border-slate-300 rounded bg-white flex items-center justify-between px-2 mb-1 shadow-sm"><span className="text-[8px] text-slate-500">Option</span><div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-slate-400"></div></div><div className="w-full h-10 border border-slate-200 shadow-md rounded bg-white p-1 space-y-1"><div className="w-full h-2 bg-rose-50 rounded"></div><div className="w-full h-2 bg-slate-50 rounded"></div></div></div>;
  if (id === 55) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-2"><div className="w-full h-7 border border-slate-300 rounded bg-white flex items-center px-2 shadow-sm"><Search size={10} className="text-slate-400 mr-1"/><span className="text-[8px] text-slate-400">Filter...</span></div></div>;
  if (id === 56) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full min-h-8 border border-slate-300 rounded bg-white flex flex-wrap items-center px-1 gap-1"><div className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[6px] border border-rose-200">React x</div><div className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[6px] border border-rose-200">Vue x</div></div></div>;
  if (id === 57) return <div className="w-full h-full bg-slate-50 flex flex-col p-3"><div className="w-full h-7 border border-slate-300 rounded mb-1 px-2 flex items-center text-[8px] bg-white">Ch</div><div className="w-full h-12 bg-white shadow-md border border-slate-100 p-1 rounded"><div className="text-[8px] text-slate-700 font-bold p-0.5 bg-slate-50">Chrome</div><div className="text-[8px] text-slate-500 p-0.5">Cherry</div></div></div>;
  if (id === 58) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 bg-white border border-slate-200 rounded shadow-md grid grid-cols-7 gap-0.5 p-1"><div className="col-span-7 h-4 bg-rose-500 rounded-t mb-1 flex items-center justify-center text-[4px] text-white">JAN</div>{[...Array(10)].map((_: unknown,i: number)=><div key={i} className="w-1.5 h-1.5 bg-slate-100 rounded-full"></div>)}<div className="w-1.5 h-1.5 bg-rose-500 rounded-full text-white"></div></div></div>;
  if (id === 59) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-24 h-14 border-2 border-dashed border-rose-300 bg-rose-50 rounded-lg flex flex-col items-center justify-center gap-1"><ArrowUp size={12} className="text-rose-400" /><span className="text-[6px] text-rose-400 font-bold">Drop files</span></div></div>;
  if (id === 60) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center shadow-sm overflow-hidden"><ImageIcon size={20} className="text-slate-300" /></div><div className="w-2 h-12 flex flex-col justify-between"><div className="w-2 h-2 bg-green-400 rounded-full"></div></div></div>;
  if (id === 61) return <div className="w-full h-full bg-slate-50 flex flex-col gap-1 p-2 items-center"><div className="w-20 h-8 bg-white border border-rose-200 shadow-lg rounded flex items-center justify-center cursor-move -rotate-6 text-[8px] font-bold text-rose-500">:: Drag Me</div></div>;
  if (id === 62) return <div className="w-full h-full bg-slate-100 relative"><div className="absolute bottom-3 right-3 w-10 h-10 bg-rose-500 rounded-full shadow-xl flex items-center justify-center text-white text-xl font-light hover:scale-110 transition-transform">+</div></div>;
  if (id === 63) return <div className="w-full h-full bg-slate-900 flex items-center justify-center relative"><div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-rose-500 animate-spin"></div><div className="absolute w-full h-full flex items-center justify-center"><MousePointer2 size={20} className="text-white fill-white animate-bounce" /></div></div>;
  if (id === 64) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="bg-slate-200 p-1 rounded-lg flex"><div className="px-3 py-1 bg-white rounded shadow-sm text-[8px] font-bold text-slate-700">Daily</div><div className="px-3 py-1 text-[8px] text-slate-400">Weekly</div></div></div>;
  if (id === 65) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="flex border border-slate-300 rounded-md overflow-hidden bg-white shadow-sm"><div className="px-2 py-1 bg-slate-50 text-slate-500 hover:bg-slate-100">-</div><div className="px-2 py-1 font-mono text-sm">1</div><div className="px-2 py-1 bg-slate-50 text-slate-500 hover:bg-slate-100">+</div></div></div>;
  if (id === 66) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full h-9 rounded-full border border-slate-300 bg-white flex items-center px-3 shadow-sm"><Search size={12} className="text-slate-400 mr-2"/><div className="w-12 h-2 bg-slate-100 rounded"></div></div></div>;
  if (id === 67) return <div className="w-full h-full bg-slate-50 flex flex-col p-3"><div className="w-full h-5 bg-slate-100 border border-slate-300 border-b-0 rounded-t flex gap-1 items-center px-2"><div className="w-2 h-2 bg-slate-400 rounded"></div><div className="w-2 h-2 bg-slate-400 rounded"></div><div className="w-px h-3 bg-slate-300 mx-1"></div><div className="w-2 h-2 bg-rose-400 rounded"></div></div><div className="w-full h-12 bg-white border border-slate-300 rounded-b p-2"><div className="w-full h-1.5 bg-slate-200 mb-1.5 rounded"></div><div className="w-2/3 h-1.5 bg-slate-200 rounded"></div></div></div>;
  if (id === 68) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-24 h-12 border border-slate-300 bg-white rounded p-1 flex items-start"><div className="w-1 h-3 bg-slate-400 animate-pulse"></div></div></div>;
  if (id === 69) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-6 h-8 border border-slate-300 rounded bg-white flex items-center justify-center font-mono">1</div><div className="w-6 h-8 border border-slate-300 rounded bg-white flex items-center justify-center font-mono">2</div><div className="w-6 h-8 border border-slate-300 rounded bg-white flex items-center justify-center font-mono">3</div><div className="w-6 h-8 border border-rose-400 rounded bg-white"></div></div>;
  if (id === 70) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-400 to-orange-400"></div></div>;
  if (id === 71) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="bg-white border border-rose-200 rounded-full px-2 py-1 text-[8px] text-rose-500">@User</div></div>;
  if (id === 72) return <div className="w-full h-full bg-slate-50 flex flex-col p-2 gap-1"><div className="flex gap-1"><div className="w-4 h-4 bg-slate-200 rounded"></div><div className="w-4 h-4 bg-slate-200 rounded"></div></div><div className="flex-1 border border-slate-200 bg-white rounded"></div></div>;
  if (id === 73) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="text-xl">👍</div><div className="text-xl grayscale opacity-50">👎</div></div>;

  // 4. Data
  if (id === 74) return <div className="w-full h-full bg-slate-50 p-3"><div className="w-full h-full border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden grid grid-cols-3 grid-rows-4 text-[4px]"><div className="bg-cyan-50 border-b border-r flex items-center justify-center font-bold text-cyan-700">ID</div><div className="bg-cyan-50 border-b border-r flex items-center justify-center font-bold text-cyan-700">Name</div><div className="bg-cyan-50 border-b flex items-center justify-center font-bold text-cyan-700">Role</div><div className="border-r border-b"></div><div className="border-r border-b"></div><div className="border-b"></div><div className="border-r border-b"></div><div className="border-r border-b"></div><div className="border-b"></div></div></div>;
  if (id === 75) return <div className="w-full h-full bg-slate-50 flex items-end justify-center gap-1.5 p-4"><div className="w-3 bg-cyan-400 h-8 rounded-t shadow-sm"></div><div className="w-3 bg-cyan-500 h-12 rounded-t shadow-sm"></div><div className="w-3 bg-cyan-300 h-5 rounded-t shadow-sm"></div><div className="w-3 bg-cyan-600 h-10 rounded-t shadow-sm"></div></div>;
  if (id === 76) return <div className="w-full h-full bg-slate-900 flex items-center justify-center"><div className="relative w-16 h-16"><div className="absolute inset-0 border-2 border-cyan-500 rounded-full animate-ping opacity-20"></div><div className="w-full h-full rounded-full border-4 border-slate-700 border-t-cyan-400 border-r-purple-400 rotate-45"></div></div></div>;
  if (id === 77) return <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-0.5"><div className="w-full h-5 bg-slate-200 rounded-t flex items-center px-1 gap-1"><div className="w-1/3 h-2 bg-slate-400 rounded"></div></div><div className="w-full h-4 bg-white border border-slate-200 flex items-center px-1"><div className="w-full h-1 bg-slate-200"></div></div><div className="w-full h-4 bg-slate-50 border border-slate-200 flex items-center px-1"><div className="w-full h-1 bg-slate-200"></div></div><div className="w-full h-4 bg-white border border-slate-200 rounded-b flex items-center px-1"><div className="w-full h-1 bg-slate-200"></div></div></div>;
  if (id === 78) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-14 h-14 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-lg">A</div></div>;
  if (id === 79) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="flex -space-x-3"><div className="w-10 h-10 rounded-full bg-red-200 border-2 border-white"></div><div className="w-10 h-10 rounded-full bg-yellow-200 border-2 border-white"></div><div className="w-10 h-10 rounded-full bg-cyan-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-cyan-700">+3</div></div></div>;
  if (id === 80) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="bg-slate-200 px-2.5 py-1 rounded-full text-[8px] text-slate-600 font-medium">Design</div><div className="bg-cyan-100 text-cyan-700 px-2.5 py-1 rounded-full text-[8px] font-bold border border-cyan-200">Code</div></div>;
  if (id === 81) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center px-3 gap-2"><div className="w-full h-10 bg-white border border-slate-200 rounded-lg flex items-center px-2 gap-3 shadow-sm hover:border-cyan-400 transition-colors"><div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">★</div><div className="flex-1 h-2 bg-slate-100 rounded"></div><div className="w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div></div></div>;
  if (id === 82) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2 overflow-hidden p-2"><div className="w-24 h-16 bg-white border border-slate-200 rounded-lg flex-shrink-0 shadow-sm opacity-50 scale-90"></div><div className="w-28 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex-shrink-0 shadow-md z-10"></div><div className="w-24 h-16 bg-white border border-slate-200 rounded-lg flex-shrink-0 shadow-sm opacity-50 scale-90"></div></div>;
  if (id === 83) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-full animate-shimmer"></div><span className="text-cyan-500 font-bold text-xs">Swipe &gt;</span></div></div>;
  if (id === 84) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center p-3 gap-1"><div className="w-full h-8 bg-white border border-slate-200 rounded-lg px-2 flex items-center justify-between shadow-sm"><div className="w-12 h-2 bg-slate-200 rounded"></div><div className="w-2 h-2 border-b-2 border-r-2 border-slate-400 rotate-45 mb-1"></div></div><div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg p-2"><div className="w-full h-1.5 bg-slate-200 mb-1.5 rounded"></div><div className="w-3/4 h-1.5 bg-slate-200 rounded"></div></div></div>;
  if (id === 85) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 rounded-full border-[6px] border-slate-100 border-t-cyan-500 border-r-blue-500 border-b-indigo-500 transform rotate-45"></div></div>;
  if (id === 86) return <div className="w-full h-full bg-slate-100 relative"><div className="absolute top-4 left-6 w-24 bg-white border border-slate-200 shadow-xl rounded-lg p-1 flex flex-col gap-0.5"><div className="w-full h-4 hover:bg-cyan-50 rounded px-2 flex items-center text-[6px]">Edit</div><div className="w-full h-4 hover:bg-cyan-50 rounded px-2 flex items-center text-[6px]">Duplicate</div><div className="w-full h-px bg-slate-100 my-0.5"></div><div className="w-full h-4 hover:bg-red-50 rounded px-2 flex items-center text-[6px] text-red-500">Delete</div></div></div>;
  if (id === 87) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center"><div className="w-16 h-6 bg-white border border-slate-300 rounded shadow-sm flex items-center justify-between px-2 text-[8px] text-slate-500">Options <div className="w-1.5 h-1.5 border-b border-r border-slate-400 rotate-45 mb-0.5"></div></div><div className="w-16 h-12 bg-white border border-slate-200 shadow-lg rounded mt-1 p-1 space-y-1"><div className="w-full h-2 bg-slate-100 rounded"></div><div className="w-full h-2 bg-slate-100 rounded"></div></div></div>;
  if (id === 88) return <div className="w-full h-full bg-slate-100 p-2 grid grid-cols-2 grid-rows-2 gap-2"><div className="bg-white rounded-lg shadow-sm p-1"><div className="w-4 h-4 bg-cyan-100 rounded-full mb-1"></div><div className="w-8 h-1 bg-slate-200 rounded"></div></div><div className="bg-white rounded-lg shadow-sm p-1"><div className="w-4 h-4 bg-purple-100 rounded-full mb-1"></div><div className="w-8 h-1 bg-slate-200 rounded"></div></div><div className="col-span-2 bg-white rounded-lg shadow-sm p-1 flex items-end gap-1"><div className="w-full h-2 bg-slate-100"></div><div className="w-full h-4 bg-cyan-200"></div><div className="w-full h-3 bg-slate-100"></div></div></div>;
  if (id === 89) return <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-1.5"><div className="flex gap-1.5 items-center"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-500"></div><div className="w-4 h-4 bg-cyan-100 rounded flex items-center justify-center text-[6px]">📁</div><span className="text-[8px] text-slate-600">Project</span></div><div className="pl-6 flex gap-1.5 items-center"><div className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center text-[6px]">📄</div><span className="text-[8px] text-slate-500">index.js</span></div></div>;
  if (id === 90) return <div className="w-full h-full bg-slate-50 p-2 flex flex-wrap content-start"><div className="w-2/3 h-2/3 bg-cyan-600 border border-white flex items-center justify-center text-white text-[8px]">60%</div><div className="w-1/3 h-2/3 bg-cyan-400 border border-white"></div><div className="w-1/2 h-1/3 bg-cyan-300 border border-white"></div><div className="w-1/2 h-1/3 bg-cyan-200 border border-white"></div></div>;
  if (id === 91) return <div className="w-full h-full bg-slate-50 p-3 grid grid-cols-5 gap-1"><div className="bg-cyan-100 rounded-sm"></div><div className="bg-cyan-300 rounded-sm"></div><div className="bg-cyan-500 rounded-sm"></div><div className="bg-cyan-200 rounded-sm"></div><div className="bg-cyan-600 rounded-sm"></div><div className="bg-cyan-100 rounded-sm"></div><div className="bg-cyan-400 rounded-sm"></div><div className="bg-cyan-200 rounded-sm"></div><div className="bg-cyan-100 rounded-sm"></div><div className="bg-cyan-500 rounded-sm"></div></div>;
  if (id === 92) return <div className="w-full h-full bg-slate-50 p-2 flex flex-col items-center justify-center relative"><div className="absolute left-1/2 -translate-x-px w-0.5 h-3/4 bg-slate-200"></div><div className="w-full flex justify-between items-center z-10 mb-2"><div className="w-10 h-4 bg-white shadow-sm border border-slate-100 rounded text-[6px] flex items-center justify-center">2023</div><div className="w-3 h-3 rounded-full bg-cyan-500 border-2 border-white ring-1 ring-cyan-200"></div><div className="w-10"></div></div><div className="w-full flex justify-between items-center z-10"><div className="w-10"></div><div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div><div className="w-10 h-4 bg-white shadow-sm border border-slate-100 rounded text-[6px] flex items-center justify-center text-slate-400">2024</div></div></div>;
  if (id === 93) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-2"><div className="w-full h-24 bg-white border border-slate-100 rounded-xl p-3 flex flex-col justify-between shadow-sm"><div className="flex justify-between items-center"><span className="text-[8px] text-slate-400 font-bold uppercase">Users</span><span className="text-[6px] text-green-500 bg-green-50 px-1 rounded">+12%</span></div><div className="text-xl font-bold text-slate-800">1,234</div></div></div>;
  if (id === 94) return <div className="w-full h-full bg-slate-100 p-2 flex gap-2"><div className="flex-1 bg-slate-200/50 rounded-lg p-1 flex flex-col gap-1"><div className="h-1.5 w-8 bg-slate-300 rounded mb-1"></div><div className="w-full h-6 bg-white rounded shadow-sm"></div><div className="w-full h-6 bg-white rounded shadow-sm"></div></div><div className="flex-1 bg-slate-200/50 rounded-lg p-1 flex flex-col gap-1"><div className="h-1.5 w-8 bg-slate-300 rounded mb-1"></div><div className="w-full h-6 bg-white rounded shadow-sm"></div></div></div>;
  if (id === 95) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="text-amber-400 drop-shadow-sm">★</div><div className="text-amber-400 drop-shadow-sm">★</div><div className="text-amber-400 drop-shadow-sm">★</div><div className="text-amber-400 drop-shadow-sm">★</div><div className="text-slate-200">★</div></div>;
  if (id === 96) return <div className="w-full h-full bg-slate-50 p-3"><div className="w-full h-8 bg-cyan-50 border border-cyan-100 rounded-md flex items-center px-2 gap-2 mb-2"><div className="w-3 h-3 bg-cyan-500 rounded-sm flex items-center justify-center text-white text-[6px]">✓</div><span className="text-[8px] text-cyan-800 font-bold">2 Selected</span></div><div className="w-full h-3 bg-white border border-slate-100 rounded-sm mb-1 opacity-50"></div><div className="w-full h-3 bg-white border border-slate-100 rounded-sm opacity-50"></div></div>;
  if (id === 97) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="group relative border border-transparent hover:border-cyan-300 hover:bg-white px-2 py-1 rounded cursor-text transition-all"><span className="text-xs text-slate-700">Click to Edit</span><div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"><div className="w-2 h-2 bg-cyan-400 rounded-full"></div></div></div></div>;
  if (id === 98) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center"><div className="w-20 h-14 bg-white border border-slate-200 rounded grid grid-cols-7 grid-rows-5 gap-px p-1"><div className="col-span-7 bg-cyan-500 h-2 mb-1"></div><div className="bg-slate-100 rounded-full w-1 h-1"></div></div></div>;
  if (id === 99) return <div className="w-full h-full bg-slate-50 flex"><div className="w-1/2 bg-red-50 flex items-center justify-center text-[8px] text-red-300">- Old</div><div className="w-1/2 bg-green-50 flex items-center justify-center text-[8px] text-green-500 font-bold">+ New</div></div>;
  if (id === 100) return <div className="w-full h-full bg-slate-50 flex items-center justify-center flex-wrap gap-1 p-2"><span className="text-lg font-bold text-cyan-600">React</span><span className="text-xs text-slate-400">Vue</span><span className="text-sm text-blue-400">Next.js</span><span className="text-[10px] text-slate-300">Svelte</span></div>;
  if (id === 101) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><span className="text-[10px] text-slate-400">2 mins ago</span></div>;
  if (id === 102) return <div className="w-full h-full bg-slate-50 flex items-center justify-center flex-col"><span className="text-[8px] text-slate-400">Revenue</span><span className="text-lg font-bold text-cyan-600">$12k</span><span className="text-[6px] text-green-500">↑ 12%</span></div>;
  if (id === 103) return <div className="w-full h-full bg-slate-900 p-2 font-mono text-[6px] text-slate-300 rounded"><span className="text-cyan-400">npm</span> install</div>;

  // 5. Status
  if (id === 104) return <div className="w-full h-full bg-slate-800/20 flex items-center justify-center relative backdrop-blur-[1px]"><div className="w-24 h-16 bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center gap-2 p-2 border border-white/50"><div className="w-12 h-2 bg-slate-100 rounded"></div><div className="flex gap-1.5"><button className="w-8 h-4 bg-slate-100 rounded text-[6px]">Cancel</button><button className="w-8 h-4 bg-amber-500 text-white rounded text-[6px] shadow-sm">OK</button></div></div></div>;
  if (id === 105) return <div className="w-full h-full bg-slate-50 flex flex-col justify-end p-3 items-center"><div className="w-full h-10 bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-xl flex items-center px-3 gap-2 transform translate-y-0 animate-in slide-in-from-bottom-2"><div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[6px]">✓</div><div className="w-12 h-1.5 bg-slate-100 rounded"></div></div></div>;
  if (id === 106) return <div className="w-full h-full bg-slate-50 flex items-center justify-center p-3"><div className="w-full bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex gap-2 items-start"><div className="w-4 h-4 bg-amber-400 rounded-full text-[8px] flex items-center justify-center text-white mt-0.5 font-bold">!</div><div className="flex-1 space-y-1"><div className="w-16 h-1.5 bg-amber-200/50 rounded"></div><div className="w-10 h-1.5 bg-amber-200/50 rounded"></div></div></div></div>;
  if (id === 107) return <div className="w-full h-full bg-slate-50 flex flex-col justify-end items-center pb-3"><div className="px-4 py-2 bg-slate-900 text-white text-[8px] font-medium rounded-md shadow-lg flex items-center gap-2"><span>Message sent</span><span className="text-amber-400 font-bold">UNDO</span></div></div>;
  if (id === 108) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 cursor-help transition-colors">?</div><div className="absolute -top-4 bg-slate-800 text-white text-[6px] px-1.5 py-0.5 rounded shadow-sm animate-bounce-subtle">Information</div><div className="absolute -top-1 w-1.5 h-1.5 bg-slate-800 rotate-45"></div></div>;
  if (id === 109) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><div className="w-16 h-6 border border-slate-300 bg-white rounded-md flex items-center justify-center text-[8px] shadow-sm">Click Me</div><div className="absolute bottom-10 bg-white border border-slate-200 shadow-xl p-2 w-24 h-12 rounded-lg flex flex-col justify-center gap-1 z-10"><div className="w-full h-1.5 bg-slate-100 rounded"></div><div className="w-2/3 h-1.5 bg-slate-100 rounded"></div></div></div>;
  if (id === 110) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm"><Bell size={20} className="text-slate-400"/></div><div className="absolute top-5 right-10 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">1</div></div>;
  if (id === 111) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>;
  if (id === 112) return <div className="w-full h-full bg-white p-4 space-y-3"><div className="flex gap-3"><div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div><div className="flex-1 space-y-2 py-1"><div className="h-2 bg-slate-100 rounded animate-pulse"></div><div className="h-2 bg-slate-100 rounded animate-pulse w-5/6"></div></div></div></div>;
  if (id === 113) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center px-6 gap-1.5"><div className="flex justify-between text-[8px] text-slate-500 font-bold"><span>Uploading...</span><span>66%</span></div><div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner"><div className="w-2/3 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div></div></div>;
  if (id === 114) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div><div className="w-4 h-0.5 bg-amber-500"></div><div className="w-2 h-2 rounded-full bg-amber-500"></div><div className="w-4 h-0.5 bg-slate-300"></div><div className="w-2 h-2 rounded-full bg-slate-300"></div></div>;
  if (id === 115) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center px-4"><div className="w-full h-8 border border-red-300 rounded-md bg-white mb-1 shadow-sm px-2 flex items-center text-[8px]">wrongpassword</div><span className="text-[8px] text-red-500 font-bold flex items-center gap-1">⚠ Password incorrect</span></div>;
  if (id === 116) return <div className="w-full h-full bg-slate-50 flex flex-col items-center pt-2 relative overflow-hidden"><div className="absolute top-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center z-10"><div className="w-3 h-3 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div></div><div className="mt-4 w-3/4 h-20 bg-white shadow-sm border border-slate-100 rounded-lg translate-y-4 transition-transform"></div></div>;
  if (id === 117) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl grayscale">📦</div><div className="w-16 h-1.5 bg-slate-200 rounded"></div><div className="w-10 h-1.5 bg-slate-200 rounded"></div></div>;
  if (id === 118) return <div className="w-full h-full bg-slate-800/80 flex items-center justify-center"><div className="w-32 h-20 bg-white rounded-lg"></div></div>;
  if (id === 119) return <div className="w-full h-full bg-slate-50 flex flex-col"><div className="w-full h-6 bg-slate-800 text-white flex items-center justify-center text-[8px]">Offline Mode</div><div className="flex-1 bg-slate-200"></div></div>;
  if (id === 120) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-32 h-16 bg-white border border-slate-200 shadow-xl rounded flex flex-col items-center justify-center gap-1"><span className="text-[6px] font-bold">Are you sure?</span><div className="flex gap-1"><div className="w-8 h-4 bg-slate-200 rounded"></div><div className="w-8 h-4 bg-red-500 rounded"></div></div></div></div>;
  if (id === 121) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 bg-slate-300 rounded-full relative"><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div></div></div>;
  if (id === 122) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="text-4xl opacity-50">🌵</div></div>;

  // 6. Style
  if (id === 123) return <div className="w-full h-full bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-2 border-fuchsia-500/50 bg-fuchsia-500/10 animate-[spin_4s_linear_infinite]" style={{transformStyle:'preserve-3d', transform:'rotateX(60deg) rotateY(0deg) rotateZ(45deg)'}}><div className="w-full h-full border-2 border-cyan-400/50 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div></div></div>;
  if (id === 124) return <div className="w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden relative"><div className="absolute w-1 h-1 bg-fuchsia-400 rounded-full top-1/4 left-1/4 animate-ping"></div><div className="absolute w-0.5 h-0.5 bg-white rounded-full bottom-1/3 right-1/3 animate-pulse"></div><div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 right-10 animate-bounce"></div><div className="absolute w-1 h-1 bg-white rounded-full bottom-2 left-10 opacity-50"></div></div>;
  if (id === 125) return <div className="w-full h-full bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden"><div className="w-32 h-32 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-purple-500 blur-xl opacity-50 animate-pulse"></div></div>;
  if (id === 126) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 bg-gradient-to-br from-fuchsia-300 to-purple-600 rounded-2xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transform rotate-12 hover:rotate-0 transition-all duration-500"></div></div>;
  if (id === 127) return <div className="w-full h-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"><div className="w-3/4 h-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl flex items-center justify-center"><div className="w-8 h-1 bg-white/30 rounded"></div></div></div>;
  if (id === 128) return <div className="w-full h-full bg-[#e0e5ec] flex items-center justify-center"><div className="w-16 h-16 bg-[#e0e5ec] rounded-2xl shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-300"></div></div></div>;
  if (id === 129) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-3"><Sparkles size={20} className="text-fuchsia-500 stroke-[1.5]" /><Cpu size={20} className="text-slate-400 stroke-[1.5]" /></div>;
  if (id === 130) return <div className="w-full h-full bg-slate-50 flex"><div className="w-1/2 h-full bg-white flex items-center justify-center border-r border-slate-200"><div className="w-4 h-4 rounded-full border border-slate-300"></div></div><div className="w-1/2 h-full bg-slate-900 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]"></div></div></div>;
  if (id === 131) return <div className="w-full h-full bg-white flex items-center justify-center border-4 border-black p-2"><div className="bg-black text-white font-black text-xs px-2 py-1">Aa</div></div>;
  if (id === 132) return <div className="w-full h-full bg-gradient-to-tr from-orange-300 via-fuchsia-300 to-indigo-400"></div>;
  if (id === 133) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-14 h-14 bg-white rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-slate-50"></div></div>;
  if (id === 134) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1.5"><div className="w-6 h-6 bg-fuchsia-200 rounded-sm border border-fuchsia-300"></div><div className="w-6 h-6 bg-fuchsia-300 rounded-lg border border-fuchsia-400"></div><div className="w-6 h-6 bg-fuchsia-400 rounded-full border border-fuchsia-500"></div></div>;
  if (id === 135) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-20 h-14 bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center gap-1"><ImageIcon size={12} className="text-slate-300 opacity-50"/><span className="text-[5px] bg-yellow-100 text-yellow-800 px-1 rounded">"Smiling Cat"</span></div></div>;
  if (id === 136) return <div className="w-full h-full bg-white relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 opacity-70"></div></div>;
  if (id === 137) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 bg-fuchsia-300 rounded-full blur-md"></div></div>;
  if (id === 138) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center">SVG</div></div>;
  if (id === 139) return <div className="w-full h-full bg-slate-50 flex items-center justify-center font-mono text-xs">A B C</div>;
  if (id === 140) return <div className="w-full h-full bg-slate-50 flex flex-col justify-center items-center gap-2"><div className="w-16 h-2 bg-slate-200"></div><div className="w-24 h-px bg-slate-300"></div><div className="w-16 h-2 bg-slate-200"></div></div>;
  if (id === 141) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-8 bg-fuchsia-500"></div><div className="w-8 h-8 bg-fuchsia-500 opacity-50"></div></div>;

  // 7. Motion (Purple)
  if (id === 142) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 bg-purple-400 rounded-xl shadow-lg animate-bounce"></div></div>;
  if (id === 143) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1 overflow-hidden"><div className="w-3 h-3 bg-purple-500 rounded-full animate-[bounce_1s_infinite]"></div><div className="w-3 h-3 bg-purple-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></div><div className="w-3 h-3 bg-purple-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></div></div>;
  if (id === 144) return <div className="w-full h-full bg-slate-50 p-3 space-y-1.5"><div className="w-full h-2 bg-slate-200 rounded transition-all hover:translate-x-2"></div><div className="w-3/4 h-2 bg-purple-200 rounded transition-all hover:scale-105"></div><div className="w-full h-2 bg-slate-200 rounded transition-all hover:-translate-x-2"></div></div>;
  if (id === 145) return <div className="w-full h-full bg-slate-50 relative overflow-hidden group"><div className="absolute w-full h-[200%] bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] animate-[spin_10s_linear_infinite] opacity-30"></div><div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-12 border-2 border-purple-500 rounded-full flex justify-center pt-2"><div className="w-1 h-2 bg-purple-500 rounded-full animate-bounce"></div></div></div></div>;
  if (id === 146) return <div className="w-full h-full bg-slate-50 flex items-center justify-center perspective-500"><div className="w-16 h-12 bg-white border border-purple-200 shadow-xl rounded-lg transform rotate-y-12 rotate-x-12 hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-[8px] text-purple-600 font-bold">3D Card</div></div>;
  if (id === 147) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1.5"><div className="w-20 h-6 bg-white border border-purple-300 shadow-md rounded cursor-grab active:cursor-grabbing transform -rotate-2 flex items-center justify-center text-[8px] text-purple-700 font-bold">::: Drag Me</div><div className="w-20 h-6 border-2 border-dashed border-slate-300 rounded bg-slate-50"></div></div>;
  if (id === 148) return <div className="w-full h-full bg-slate-50 relative overflow-hidden"><div className="absolute top-2 left-4 w-4 h-4 rounded-full bg-red-400 shadow-sm animate-[bounce_2s_infinite]"></div><div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-blue-400 shadow-sm animate-[bounce_3s_infinite_0.5s]"></div><div className="absolute bottom-0 w-full h-1 bg-slate-300"></div></div>;
  if (id === 149) return <div className="w-full h-full bg-black relative overflow-hidden"><div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')] opacity-20"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-400 blur-md animate-pulse"></div><div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div></div>;
  if (id === 150) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border border-slate-200 rounded-full flex items-center justify-center relative"><div className="absolute w-full h-full border border-purple-500 rounded-full animate-[spin_4s_linear_infinite] border-t-transparent"></div><div className="w-2 h-2 bg-black rounded-full"></div></div></div>;

  // 9. Data & Communication (151-162)
  if (id === 151) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-[8px] font-bold text-teal-700">C</div><div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-[8px] font-bold text-teal-700">R</div><div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-[8px] font-bold text-teal-700">U</div><div className="w-6 h-6 bg-teal-100 rounded flex items-center justify-center text-[8px] font-bold text-teal-700">D</div></div>;
  if (id === 152) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-8 bg-slate-200 rounded-lg"></div><div className="h-0.5 w-6 bg-teal-400"></div><div className="w-8 h-8 bg-teal-500 rounded-lg shadow-sm"></div></div>;
  if (id === 153) return <div className="w-full h-full bg-slate-900 flex items-center justify-center"><div className="text-teal-400 font-bold text-xl">⚡</div></div>;
  if (id === 154) return <div className="w-full h-full bg-slate-50 flex items-center justify-center font-mono text-[8px] text-slate-500 p-2">{`{ "id": 1 }`}</div>;
  if (id === 155) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-10 h-8 border-2 border-teal-500 rounded-md"></div><div className="w-4 h-6 border-2 border-slate-300 rounded-sm"></div></div>;
  if (id === 156) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-6 border border-slate-300 rounded-full flex items-center justify-center gap-1 bg-white shadow-sm"><span className="text-[6px] text-teal-600 font-bold">WHERE</span><span className="text-[6px] text-slate-400">id=1</span></div></div>;
  if (id === 157) return <div className="w-full h-full bg-slate-50 p-3"><div className="w-full h-2 bg-teal-200 mb-1 rounded"></div><div className="w-full h-px bg-slate-200 mb-1"></div><div className="w-2/3 h-1.5 bg-slate-200 mb-1 rounded"></div><div className="w-1/2 h-1.5 bg-slate-200 rounded"></div></div>;
  if (id === 158) return <div className="w-full h-full bg-slate-100 flex items-center justify-center"><div className="w-24 h-6 bg-white border border-slate-300 rounded text-[6px] flex items-center px-1 text-slate-400">/api/users</div></div>;
  if (id === 159) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-24 h-6 bg-white border border-teal-300 rounded text-[6px] flex items-center px-1 text-teal-600">?q=apple</div></div>;
  if (id === 160) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-teal-500 animate-spin"></div><div className="w-8 h-8 bg-teal-100 rounded opacity-50"></div></div>;
  if (id === 161) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1"><div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[6px] rounded font-bold">GET</div><div className="px-2 py-0.5 bg-green-100 text-green-700 text-[6px] rounded font-bold">POST</div></div>;
  if (id === 162) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><Bell size={24} className="text-teal-500" /><div className="absolute top-3 right-5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div></div>;

  // 10. Development Concepts (163-175)
  if (id === 163) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-0.5"><div className="w-6 h-6 bg-slate-300 rounded-sm"></div><div className="w-6 h-6 bg-slate-400 rounded-sm"></div><div className="w-6 h-6 bg-slate-500 rounded-sm"></div></div>;
  if (id === 164) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1"><div className="w-12 h-6 bg-slate-200 rounded border border-slate-300"></div><ArrowUp size={12} className="text-slate-400 rotate-180" /><div className="w-10 h-5 bg-slate-100 rounded border border-slate-200 text-[6px] flex items-center justify-center text-slate-500">props</div></div>;
  if (id === 165) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-4 bg-slate-200 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-slate-500 rounded-full"></div></div><span className="text-[8px] font-bold text-slate-500">ON</span></div>;
  if (id === 166) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="text-slate-400 font-mono text-xs">use...</div></div>;
  if (id === 167) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-10 border border-red-200 bg-red-50 rounded flex flex-col p-1 gap-0.5"><div className="w-full h-0.5 bg-red-300"></div><div className="w-full h-0.5 bg-red-300 transform rotate-3"></div></div><ArrowRight size={12} className="text-slate-300" /><div className="w-8 h-10 border border-green-200 bg-green-50 rounded flex flex-col p-1 gap-0.5"><div className="w-full h-0.5 bg-green-300"></div><div className="w-full h-0.5 bg-green-300"></div></div></div>;
  if (id === 168) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1"><span className="text-[6px] text-red-400 line-through">"Hello"</span><span className="text-[6px] text-green-600 font-mono">const text</span></div>;
  if (id === 169) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-12 bg-white border border-dashed border-slate-300 rounded p-1 text-[4px] text-slate-300 leading-tight">Lorem ipsum dolor sit amet...</div></div>;
  if (id === 170) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="flex gap-0.5 items-end"><div className="w-2 h-6 bg-slate-300 rounded-sm"></div><div className="w-2 h-8 bg-slate-400 rounded-sm"></div><div className="w-2 h-5 bg-slate-300 rounded-sm"></div><div className="w-2 h-7 bg-slate-500 rounded-sm"></div></div></div>;
  if (id === 171) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-slate-200 rounded-lg relative"><div className="absolute top-0 left-0 w-full h-4 bg-slate-200"></div></div></div>;
  if (id === 172) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-1"><div className="w-6 h-6 bg-slate-200 rounded"></div><ArrowRight size={12} className="text-slate-400" /><div className="w-6 h-6 bg-slate-300 rounded"></div></div>;
  if (id === 173) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><Server size={20} className="text-slate-400" /><ArrowRight size={12} className="text-slate-300" /><div className="w-8 h-10 bg-white border border-slate-200 shadow-sm"></div></div>;
  if (id === 174) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-8 h-10 bg-white border border-slate-200 shadow-sm"></div><ArrowRight size={12} className="text-slate-300" /><Globe size={20} className="text-slate-400" /></div>;
  if (id === 175) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="relative w-16 h-16"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full z-10"></div><div className="absolute bottom-0 left-0 w-3 h-3 bg-slate-300 rounded-full z-10"></div><div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 rounded-full z-10"></div><div className="absolute inset-0 border-t-2 border-x-2 border-slate-200 rounded-full clip-path-triangle"></div></div></div>;

  // 11. Tools & Libraries (176-188)
  if (id === 176) return <div className="w-full h-full bg-slate-50 flex items-end justify-center gap-1 p-3"><div className="w-2 h-4 bg-sky-300 rounded-t"></div><div className="w-2 h-8 bg-sky-500 rounded-t"></div><div className="w-2 h-6 bg-sky-400 rounded-t"></div></div>;
  if (id === 177) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div></div>;
  if (id === 178) return <div className="w-full h-full bg-yellow-50 flex items-center justify-center text-xl">🐻</div>;
  if (id === 179) return <div className="w-full h-full bg-slate-50 flex items-center justify-center font-mono text-[8px] text-sky-600">cn(...)</div>;
  if (id === 180) return <div className="w-full h-full bg-slate-50 flex items-center justify-center gap-2"><div className="w-6 h-6 text-sky-500"><Sparkles size={16}/></div><div className="w-6 h-6 text-sky-500"><Zap size={16}/></div></div>;
  if (id === 181) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="text-[8px] font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">Axios</div></div>;
  if (id === 182) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Lock size={20} className="text-sky-500" /></div>;
  if (id === 183) return <div className="w-full h-full bg-slate-50 flex items-center justify-center relative"><div className="w-8 h-8 bg-red-400 rounded absolute left-4 opacity-50"></div><div className="w-8 h-8 bg-blue-500 rounded absolute right-4 z-10"></div></div>;
  if (id === 184) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 bg-white border border-slate-200 rounded text-[8px] p-1 flex flex-col items-center justify-center"><span className="text-sky-500 font-bold">24</span><span>Dec</span></div></div>;
  if (id === 185) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1"><div className="w-12 h-2 bg-slate-200 rounded"></div><div className="w-12 h-2 bg-slate-200 rounded"></div><div className="w-8 h-4 bg-sky-500 rounded text-white text-[6px] flex items-center justify-center">Submit</div></div>;
  if (id === 186) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-10 h-12 bg-pink-500 rounded-sm shadow-sm flex items-center justify-center text-white font-bold text-xs">Sb</div></div>;
  if (id === 187) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="text-[10px] text-sky-600 font-serif font-bold italic">Prettier</div></div>;
  if (id === 188) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-full text-center text-[6px] text-slate-400"><span className="underline decoration-red-500 decoration-wavy">const a = 1;</span></div></div>;

  // 12. Deployment & Ops (189-200) - Emerald
  if (id === 189) return <div className="w-full h-full bg-black flex items-center justify-center"><div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-white"></div></div>;
  if (id === 190) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">🚀</div></div>;
  if (id === 191) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Box size={24} className="text-emerald-500" /></div>;
  if (id === 192) return <div className="w-full h-full bg-slate-900 flex items-center justify-center font-mono text-[8px] text-emerald-400">.env</div>;
  if (id === 193) return <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center"><div className="w-20 h-6 bg-white border border-slate-200 rounded shadow-sm flex items-center px-2 gap-1"><Search size={8} className="text-emerald-500"/><div className="w-10 h-1 bg-slate-100"></div></div></div>;
  if (id === 194) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><div className="w-24 h-14 bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col"><div className="h-8 bg-slate-100"></div><div className="flex-1 p-1"><div className="w-full h-1 bg-slate-200 mb-1"></div><div className="w-2/3 h-1 bg-slate-200"></div></div></div></div>;
  if (id === 195) return <div className="w-full h-full bg-slate-100 flex items-end"><div className="w-24 h-8 bg-white rounded-t-lg mx-auto flex items-center px-2 gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div><div className="w-10 h-1 bg-slate-200"></div></div></div>;
  if (id === 196) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Smartphone size={24} className="text-emerald-500" /></div>;
  if (id === 197) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Globe2 size={24} className="text-emerald-500" /></div>;
  if (id === 198) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><GitBranch size={24} className="text-emerald-600" /></div>;
  if (id === 199) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Bug size={24} className="text-red-400" /></div>;
  if (id === 200) return <div className="w-full h-full bg-slate-50 flex items-center justify-center"><FileText size={24} className="text-slate-400" /></div>;

  return <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-2xl">{id}</div>;
};

// --- 메인 앱 컴포넌트 ---
export const VibeCodingGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [lang, setLang] = useState<string>('ko'); 
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const t = UI_TEXT[lang];

  // 카테고리 추출
  const categories = useMemo<string[]>(() => [
    '전체',
    '모션/인터랙션',
    '스타일/비주얼',
    '상태/피드백',
    '구조/레이아웃',
    '내비게이션',
    '입력/조작',
    '정보/데이터',
    '고급/AI',
    '데이터/통신',
    '개발/개념',
    '도구/라이브러리',
    '배포/운영'
  ], []);

  // 필터링 및 그룹화 로직
  const groupedTerms = useMemo<Record<string, Term[]>>(() => {
    const filtered = TERMS_DATA.filter(term => 
      term.termKr.includes(searchTerm) || 
      term.termEn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categoryFiltered = selectedCategory === '전체' 
      ? filtered 
      : filtered.filter(term => term.category === selectedCategory);

    if (selectedCategory === '전체' && searchTerm === '') {
      const groups: Record<string, Term[]> = {};
      categories.forEach(cat => {
        if (cat === '전체') return;
        groups[cat] = categoryFiltered.filter(t => t.category === cat);
      });
      return groups;
    } else {
      return { [selectedCategory === '전체' ? '검색 결과' : selectedCategory]: categoryFiltered };
    }
  }, [searchTerm, selectedCategory, categories]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleLang = () => setLang(prev => prev === 'ko' ? 'en' : 'ko');

  // Audio Control Effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(!isMuted);

  const handleIntroExplore = () => {
    if (audioRef.current) {
      setIsMuted(false);
      audioRef.current.play().catch(e => console.log("Audio play failed on explore:", e));
    }
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 pb-20">
      
      {/* --- Background Audio --- */}
      <audio ref={audioRef} src="https://raw.githubusercontent.com/moonsugugu/ugs/main/code.mp3" loop />

      {/* --- Intro Overlay --- */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md text-white overflow-hidden animate-in fade-in duration-500">
          <div className="absolute inset-0 pointer-events-none">
             <ParticleBackground />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4">
             {/* Glassmorphism Card */}
             <div className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-700 ring-1 ring-white/20">
                <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-bounce-subtle">
                  <Sparkles size={40} className="text-white" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight whitespace-pre-line leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
                  {t.intro.welcome}
                </h1>
                
                <p className="text-slate-300 text-sm md:text-base font-medium mb-10 whitespace-pre-line leading-relaxed">
                  {t.intro.desc}
                </p>
                
                <button 
                  onClick={handleIntroExplore}
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">{t.intro.button}</span>
                  <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
             </div>
             
             <div className="absolute bottom-8 text-slate-500 text-xs font-mono">
                PRESS START
             </div>
          </div>
        </div>
      )}

      {/* --- Header (3D Particle Background) --- */}
      <div className="relative h-64 overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-slate-900 shadow-xl mb-4">
        {!showIntro && <ParticleBackground />}
        <div className="relative z-10 space-y-2 animate-in fade-in zoom-in duration-700">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-lg tracking-tight">
            {t.title}
          </h1>
          <p className="text-slate-300 font-medium text-sm md:text-base border border-white/10 bg-white/5 rounded-full px-4 py-1 inline-block backdrop-blur-sm">
            {t.subtitle}
          </p>
        </div>
        
        {/* Mute Toggle (Absolute Top Right) */}
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-24 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all backdrop-blur-md"
        >
          <div className="flex gap-0.5 items-end h-4 w-4 justify-center">
             <div className={`w-1 bg-white rounded-full transition-all duration-300 ${!isMuted ? 'h-3 animate-[pulse_0.6s_ease-in-out_infinite]' : 'h-1'}`}></div>
             <div className={`w-1 bg-white rounded-full transition-all duration-300 delay-75 ${!isMuted ? 'h-4 animate-[pulse_0.8s_ease-in-out_infinite]' : 'h-1'}`}></div>
             <div className={`w-1 bg-white rounded-full transition-all duration-300 delay-150 ${!isMuted ? 'h-2 animate-[pulse_1s_ease-in-out_infinite]' : 'h-1'}`}></div>
          </div>
          <span className="font-mono tracking-wide">{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
        </button>

        {/* Lang Toggle (Absolute Top Right) */}
        <button 
          onClick={toggleLang}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all backdrop-blur-md"
        >
          <Globe size={14} />
          {lang === 'ko' ? 'EN' : '한글'}
        </button>
      </div>

      {/* --- Sticky Navigation Bar --- */}
      <div className="sticky top-4 z-40 px-4 mb-10">
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-2 pl-2 flex flex-col md:flex-row items-center justify-between gap-2 transition-all hover:shadow-xl">
          
          {/* Categories (Wrap) */}
          <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 p-1">
              {categories.map((cat: string) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                        : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {/* Icon Rendering */}
                    {cat === '전체' ? (
                      <Menu size={14} strokeWidth={2.5} />
                    ) : (
                      CATEGORY_ICONS[cat] && React.cloneElement(CATEGORY_ICONS[cat] as React.ReactElement<any>, { size: 14, strokeWidth: 2.5 })
                    )}
                    <span>{cat === '전체' ? t.all : cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar (Right) */}
          <div className="relative w-full md:w-60 flex-shrink-0 mr-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-xs font-bold placeholder:text-slate-400 text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="max-w-[90rem] mx-auto px-4 space-y-12 min-h-[50vh]">
        {Object.entries(groupedTerms).map(([category, terms]: [string, Term[]]) => (
          <div key={category} className="relative space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Section Background Gradient */}
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-${CATEGORY_COLORS[category] || 'slate'}-100/50 via-transparent to-transparent rounded-[2rem] -m-4 p-4 pointer-events-none`}></div>
            
            {/* Section Title */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className={`w-1.5 h-8 rounded-full ${category === '검색 결과' ? 'bg-slate-400' : `bg-${CATEGORY_COLORS[category] || 'slate'}-500`}`}></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {category} 
                <span className="ml-2 text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full align-middle">
                  {terms.length}
                </span>
              </h2>
              {category !== '검색 결과' && CATEGORY_DESCRIPTIONS[category] && (
                <span className="hidden md:block text-xs text-slate-400 font-medium mt-1">
                  — {CATEGORY_DESCRIPTIONS[category]}
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative z-10">
              {terms.map((term) => (
                <div 
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}
                  className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-64"
                >
                  {/* Card Header (Preview) */}
                  <div className="h-32 bg-slate-50 relative overflow-hidden border-b border-slate-50 group-hover:border-slate-100 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center p-4 transform group-hover:scale-105 transition-transform duration-500">
                       <VisualPreview term={term} />
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm text-${CATEGORY_COLORS[term.category]}-600`}>
                      {term.category}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {term.termKr}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 font-mono">
                          {term.termEn}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {term.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedTerms).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-500">검색 결과가 없습니다.</p>
            <p className="text-sm text-slate-400">다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </div>

      {/* --- Detail Modal --- */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedTerm(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 ring-1 ring-black/5">
            
            {/* Left: Visual & Quick Info */}
            <div className="w-full md:w-2/5 bg-slate-50 border-r border-slate-100 flex flex-col">
              <div className="h-48 md:h-1/2 min-h-[200px] border-b border-slate-200 relative overflow-hidden flex items-center justify-center p-8 bg-grid-slate-200/50">
                 <div className="w-full h-full shadow-sm bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                    <VisualPreview term={selectedTerm} />
                 </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold mb-3 bg-${CATEGORY_COLORS[selectedTerm.category]}-50 text-${CATEGORY_COLORS[selectedTerm.category]}-600 border border-${CATEGORY_COLORS[selectedTerm.category]}-100`}>
                  {selectedTerm.category}
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedTerm.termKr}</h2>
                <p className="text-sm font-mono text-slate-400 font-bold mb-4">{selectedTerm.termEn}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.modal.summary}</h4>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedTerm.summary}</p>
                  </div>
                  
                  {selectedTerm.related.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.modal.related}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTerm.related.map(relId => {
                          const relTerm = TERMS_DATA.find(t => t.id === relId);
                          if (!relTerm) return null;
                          return (
                            <button
                              key={relId}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTerm(relTerm);
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                              {relTerm.termKr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Detail & Prompts */}
            <div className="w-full md:w-3/5 bg-white flex flex-col h-[50vh] md:h-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                   <Sparkles size={16} className="text-indigo-500" />
                   <span className="text-xs font-bold text-slate-500">AI Prompt Guide</span>
                </div>
                <button 
                  onClick={() => setSelectedTerm(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    {t.modal.detail}
                  </h3>
                  <p className="text-slate-600 leading-7 text-sm md:text-base">
                    {selectedTerm.detail}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Korean Prompt */}
                  <div className="relative group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {t.modal.promptKr}
                      </label>
                      <button 
                        onClick={() => handleCopy(selectedTerm.promptKr, 'kr')}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors font-medium"
                      >
                        {copied === 'kr' ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'kr' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-700 leading-relaxed group-hover:border-indigo-200 transition-colors relative overflow-hidden">
                       {selectedTerm.promptKr}
                       <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                    </div>
                  </div>

                  {/* English Prompt */}
                  <div className="relative group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet