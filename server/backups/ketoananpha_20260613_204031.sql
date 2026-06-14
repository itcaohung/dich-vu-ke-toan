--
-- PostgreSQL database dump
--

\restrict vRBHWdSXsoeccOZ6ekkICS4L1HxQxNfIplFhtiMlMaRd0LqEWdLlQYNgR4zVigo

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: jaycao
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO jaycao;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: jaycao
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ContactStatus; Type: TYPE; Schema: public; Owner: jaycao
--

CREATE TYPE public."ContactStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public."ContactStatus" OWNER TO jaycao;

--
-- Name: PostStatus; Type: TYPE; Schema: public; Owner: jaycao
--

CREATE TYPE public."PostStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."PostStatus" OWNER TO jaycao;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: jaycao
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO jaycao;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Banner; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Banner" (
    id integer NOT NULL,
    title text,
    subtitle text,
    image text NOT NULL,
    link text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Banner" OWNER TO jaycao;

--
-- Name: Banner_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Banner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Banner_id_seq" OWNER TO jaycao;

--
-- Name: Banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Banner_id_seq" OWNED BY public."Banner".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO jaycao;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO jaycao;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Contact; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Contact" (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    service text,
    message text,
    source text,
    status public."ContactStatus" DEFAULT 'NEW'::public."ContactStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contact" OWNER TO jaycao;

--
-- Name: Contact_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Contact_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Contact_id_seq" OWNER TO jaycao;

--
-- Name: Contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Contact_id_seq" OWNED BY public."Contact".id;


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."MenuItem" (
    id integer NOT NULL,
    label text NOT NULL,
    url text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "openNew" boolean DEFAULT false NOT NULL,
    "parentId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MenuItem" OWNER TO jaycao;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."MenuItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuItem_id_seq" OWNER TO jaycao;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."MenuItem_id_seq" OWNED BY public."MenuItem".id;


--
-- Name: Office; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Office" (
    id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    zalo text,
    "mapUrl" text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Office" OWNER TO jaycao;

--
-- Name: Office_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Office_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Office_id_seq" OWNER TO jaycao;

--
-- Name: Office_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Office_id_seq" OWNED BY public."Office".id;


--
-- Name: Post; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Post" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    thumbnail text,
    views integer DEFAULT 0 NOT NULL,
    status public."PostStatus" DEFAULT 'DRAFT'::public."PostStatus" NOT NULL,
    "categoryId" integer,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Post" OWNER TO jaycao;

--
-- Name: Post_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Post_id_seq" OWNER TO jaycao;

--
-- Name: Post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Post_id_seq" OWNED BY public."Post".id;


--
-- Name: Service; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Service" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    content text,
    price text,
    icon text,
    image text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO jaycao;

--
-- Name: Service_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Service_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Service_id_seq" OWNER TO jaycao;

--
-- Name: Service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Service_id_seq" OWNED BY public."Service".id;


--
-- Name: Setting; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Setting" (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Setting" OWNER TO jaycao;

--
-- Name: Setting_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Setting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Setting_id_seq" OWNER TO jaycao;

--
-- Name: Setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Setting_id_seq" OWNED BY public."Setting".id;


--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."TeamMember" (
    id integer NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    bio text,
    avatar text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TeamMember" OWNER TO jaycao;

--
-- Name: TeamMember_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."TeamMember_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TeamMember_id_seq" OWNER TO jaycao;

--
-- Name: TeamMember_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."TeamMember_id_seq" OWNED BY public."TeamMember".id;


--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."Testimonial" (
    id integer NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    company text NOT NULL,
    text text NOT NULL,
    avatar text,
    rating integer DEFAULT 5 NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Testimonial" OWNER TO jaycao;

--
-- Name: Testimonial_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."Testimonial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Testimonial_id_seq" OWNER TO jaycao;

--
-- Name: Testimonial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."Testimonial_id_seq" OWNED BY public."Testimonial".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: jaycao
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'ADMIN'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO jaycao;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: jaycao
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO jaycao;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jaycao
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Banner id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Banner" ALTER COLUMN id SET DEFAULT nextval('public."Banner_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Contact id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Contact" ALTER COLUMN id SET DEFAULT nextval('public."Contact_id_seq"'::regclass);


--
-- Name: MenuItem id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."MenuItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuItem_id_seq"'::regclass);


--
-- Name: Office id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Office" ALTER COLUMN id SET DEFAULT nextval('public."Office_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: Service id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Service" ALTER COLUMN id SET DEFAULT nextval('public."Service_id_seq"'::regclass);


--
-- Name: Setting id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Setting" ALTER COLUMN id SET DEFAULT nextval('public."Setting_id_seq"'::regclass);


--
-- Name: TeamMember id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."TeamMember" ALTER COLUMN id SET DEFAULT nextval('public."TeamMember_id_seq"'::regclass);


--
-- Name: Testimonial id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Testimonial" ALTER COLUMN id SET DEFAULT nextval('public."Testimonial_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Banner" (id, title, subtitle, image, link, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
1	Dịch Vụ Kế Toán Trọn Gói	Uy tín – Chuyên nghiệp – Đúng hạn	/uploads/2026-06/1781357697741-pfgrvaeywx.png	\N	1	t	2026-06-13 13:07:37.145	2026-06-13 13:35:12.876
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Category" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
1	Kế Toán - Thuế	ke-toan-thue	2026-06-13 13:07:37.111	2026-06-13 13:07:37.111
2	Thành Lập Doanh Nghiệp	thanh-lap-doanh-nghiep	2026-06-13 13:07:37.111	2026-06-13 13:07:37.111
3	Lao Động - Bảo Hiểm	lao-dong-bao-hiem	2026-06-13 13:07:37.111	2026-06-13 13:07:37.111
4	Pháp Luật Doanh Nghiệp	phap-luat-doanh-nghiep	2026-06-13 13:07:37.111	2026-06-13 13:07:37.111
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Contact" (id, name, phone, email, service, message, source, status, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."MenuItem" (id, label, url, "order", "isActive", "openNew", "parentId", "createdAt", "updatedAt") FROM stdin;
1	Trang chủ	/	1	t	f	\N	2026-06-13 13:07:37.147	2026-06-13 13:07:37.147
2	Dịch vụ	/dich-vu	2	t	f	\N	2026-06-13 13:07:37.147	2026-06-13 13:07:37.147
3	Tin tức	/tin-tuc	3	t	f	\N	2026-06-13 13:07:37.147	2026-06-13 13:07:37.147
4	Giới thiệu	/gioi-thieu	4	t	f	\N	2026-06-13 13:07:37.147	2026-06-13 13:07:37.147
5	Liên hệ	/lien-he	5	t	f	\N	2026-06-13 13:07:37.147	2026-06-13 13:07:37.147
\.


--
-- Data for Name: Office; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Office" (id, name, address, phone, email, zalo, "mapUrl", "order", "isActive", "createdAt", "updatedAt") FROM stdin;
1	TP. Hồ Chí Minh (Trụ Sở)	144 Đinh Tiên Hoàng, P.1, Q. Bình Thạnh, TP.HCM	(028) 2244 6739	hcm@ketoananpha.vn	\N	\N	1	t	2026-06-13 13:07:37.134	2026-06-13 13:07:37.134
2	Hà Nội	Tầng 7, 57 Trần Quốc Toản, Q. Hoàn Kiếm, Hà Nội	(024) 6295 5968	hn@ketoananpha.vn	\N	\N	2	t	2026-06-13 13:07:37.135	2026-06-13 13:07:37.135
3	Đà Nẵng	Tầng 5, 82 Hùng Vương, Q. Hải Châu, Đà Nẵng	(0236) 3030 779	dn@ketoananpha.vn	\N	\N	3	t	2026-06-13 13:07:37.136	2026-06-13 13:07:37.136
4	Cần Thơ	Số 66 Mậu Thân, Q. Ninh Kiều, TP. Cần Thơ	(0292) 3012 555	ct@ketoananpha.vn	\N	\N	4	t	2026-06-13 13:07:37.137	2026-06-13 13:07:37.137
5	Đồng Nai	Số 12 Nguyễn Ái Quốc, P. Tân Hiệp, Biên Hòa, Đồng Nai	(0251) 3881 288	dn2@ketoananpha.vn	\N	\N	5	t	2026-06-13 13:07:37.137	2026-06-13 13:07:37.137
6	Bình Dương	Số 8 Đại lộ Bình Dương, P. Phú Hòa, TP. Thủ Dầu Một	(0274) 2222 568	bd@ketoananpha.vn	\N	\N	6	t	2026-06-13 13:07:37.138	2026-06-13 13:07:37.138
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Post" (id, title, slug, excerpt, content, thumbnail, views, status, "categoryId", "publishedAt", "createdAt", "updatedAt") FROM stdin;
1	Thủ tục thành lập công ty TNHH 1 thành viên năm 2025 mới nhất	thu-tuc-thanh-lap-cong-ty-tnhh-1-thanh-vien-2025	Hướng dẫn chi tiết thủ tục thành lập công ty TNHH 1 thành viên theo quy định mới nhất của Luật Doanh nghiệp 2020.	<p>Công ty TNHH 1 thành viên là loại hình doanh nghiệp phổ biến nhất tại Việt Nam hiện nay...</p>	\N	15234	PUBLISHED	2	2025-06-10 00:00:00	2026-06-13 13:07:37.128	2026-06-13 13:07:37.128
2	Cách đặt tên công ty theo quy định mới nhất của Luật Doanh Nghiệp	cach-dat-ten-cong-ty-theo-quy-dinh-luat-doanh-nghiep	Những lưu ý quan trọng khi đặt tên công ty để đảm bảo đáp ứng đúng quy định pháp luật.	<p>Việc đặt tên công ty là bước đầu tiên và quan trọng trong quá trình thành lập doanh nghiệp...</p>	\N	12890	PUBLISHED	2	2025-06-08 00:00:00	2026-06-13 13:07:37.131	2026-06-13 13:07:37.131
3	Mức thuế môn bài năm 2025 cho hộ kinh doanh và doanh nghiệp	muc-thue-mon-bai-2025	Cập nhật mức thuế môn bài năm 2025 áp dụng cho hộ kinh doanh cá thể và doanh nghiệp theo thông tư mới.	<p>Thuế môn bài (hay lệ phí môn bài) là loại thuế mà các tổ chức, cá nhân hoạt động kinh doanh phải nộp...</p>	\N	9456	PUBLISHED	1	2025-06-05 00:00:00	2026-06-13 13:07:37.132	2026-06-13 13:07:37.132
4	Quy định về vốn điều lệ tối thiểu khi thành lập công ty 2025	quy-dinh-von-dieu-le-toi-thieu-thanh-lap-cong-ty-2025	Vốn điều lệ khi thành lập công ty cần tối thiểu bao nhiêu? Tổng hợp quy định mới nhất theo ngành nghề.	<p>Hiện nay, pháp luật Việt Nam không quy định mức vốn điều lệ tối thiểu chung...</p>	\N	8123	PUBLISHED	4	2025-06-03 00:00:00	2026-06-13 13:07:37.133	2026-06-13 13:07:37.133
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Service" (id, title, slug, description, content, price, icon, image, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
1	Kế Toán Trọn Gói	ke-toan-tron-goi	Hạch toán sổ sách, lập báo cáo tài chính, quyết toán thuế hàng tháng/quý/năm.	\N	Từ 500.000đ/tháng	fa-calculator	\N	1	t	2026-06-13 13:07:37.119	2026-06-13 13:07:37.119
2	Thành Lập Công Ty TNHH	thanh-lap-cong-ty-tnhh	Tư vấn loại hình, soạn hồ sơ, nộp đăng ký kinh doanh, khắc dấu và giao tận nơi.	\N	Từ 250.000đ	fa-building	\N	2	t	2026-06-13 13:07:37.122	2026-06-13 13:07:37.122
3	Khai Báo & Quyết Toán Thuế	khai-bao-quyet-toan-thue	Kê khai thuế GTGT, TNDN, TNCN đúng hạn. Hỗ trợ giải trình, kiểm tra thuế.	\N	Từ 300.000đ/lần	fa-file-invoice-dollar	\N	3	t	2026-06-13 13:07:37.122	2026-06-13 13:07:37.122
4	Thay Đổi Giấy Phép Kinh Doanh	thay-doi-giay-phep-kinh-doanh	Thay đổi tên, địa chỉ, vốn điều lệ, người đại diện, ngành nghề kinh doanh.	\N	Từ 500.000đ/lần	fa-edit	\N	4	t	2026-06-13 13:07:37.123	2026-06-13 13:07:37.123
5	Thành Lập Công Ty FDI	thanh-lap-cong-ty-fdi	Tư vấn đầu tư nước ngoài, xin giấy chứng nhận đăng ký đầu tư.	\N	Từ 15.000.000đ	fa-globe	\N	5	t	2026-06-13 13:07:37.124	2026-06-13 13:07:37.124
6	Bảo Hiểm Xã Hội & Lao Động	bao-hiem-xa-hoi-lao-dong	Đăng ký BHXH, BHYT, BHTN. Lập hợp đồng lao động, nội quy công ty.	\N	Từ 200.000đ/tháng	fa-shield-alt	\N	6	t	2026-06-13 13:07:37.125	2026-06-13 13:07:37.125
7	Chữ Ký Số & Hóa Đơn Điện Tử	chu-ky-so-hoa-don-dien-tu	Đăng ký chữ ký số token, hóa đơn điện tử theo Thông tư 78/2021/TT-BTC.	\N	Từ 1.800.000đ/năm	fa-file-signature	\N	7	t	2026-06-13 13:07:37.126	2026-06-13 13:07:37.126
8	Đào Tạo Kế Toán Thực Tế	dao-tao-ke-toan-thuc-te	Đào tạo kế toán thực hành trên phần mềm MISA, Fast, Excel.	\N	Từ 2.500.000đ/khóa	fa-graduation-cap	\N	8	t	2026-06-13 13:07:37.127	2026-06-13 13:07:37.127
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Setting" (id, key, value, "updatedAt") FROM stdin;
2	site_description	Dịch vụ kế toán trọn gói uy tín từ 2007	2026-06-13 13:17:06.076
4	email	cskh@ketoananpha.vn	2026-06-13 13:17:06.076
3	hotline	1900 6234	2026-06-13 13:17:06.076
8	address	144 Đinh Tiên Hoàng, P.1, Q. Bình Thạnh, TP.HCM	2026-06-13 13:17:06.076
10	tax_code	0307520384	2026-06-13 13:17:06.076
1	site_name	Kế Toán Minh Châu	2026-06-13 13:17:06.076
9	working_hours	Thứ 2 – Thứ 7: 08:00 – 17:30	2026-06-13 13:17:06.076
7	zalo	1900 6234	2026-06-13 13:17:06.076
11	established_year	2007	2026-06-13 13:17:06.076
6	youtube		2026-06-13 13:17:06.076
5	facebook	https://facebook.com/ketoananpha	2026-06-13 13:17:06.076
35	favicon	/uploads/2026-06/1781356620045-upb34rmp8x.png	2026-06-13 13:17:06.076
34	logo	/uploads/2026-06/1781356614929-wv0tggovvmr.png	2026-06-13 13:17:06.076
\.


--
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."TeamMember" (id, name, title, bio, avatar, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
1	Phạm Thị Hưng	Trưởng BP Thành Lập DN		/uploads/2026-06/1781356919637-870d5jr9mj.png	1	t	2026-06-13 13:07:37.15	2026-06-13 13:22:00.944
2	Phạm Thị Y Lênh	Trưởng BP Kế Toán Thuế		/uploads/2026-06/1781356927418-cignonaif8q.png	2	t	2026-06-13 13:07:37.15	2026-06-13 13:22:08.698
3	Trương Thị Hạnh	Trưởng BP Thuế Kế Toán		/uploads/2026-06/1781356934522-tbsn0x3m3d.png	3	t	2026-06-13 13:07:37.15	2026-06-13 13:22:15.822
4	Phạm Thị Lệ	Trưởng BP Thuế Kế Toán		/uploads/2026-06/1781356941383-w07z4akka1f.png	4	t	2026-06-13 13:07:37.15	2026-06-13 13:22:22.571
5	Bùi Thị Thanh Dung	Trưởng BP Thuế Kế Toán		/uploads/2026-06/1781356947850-q9f9264n4qe.png	5	t	2026-06-13 13:07:37.15	2026-06-13 13:22:28.931
6	Lê Thị Hà	Trưởng BP Thuế Kế Toán		/uploads/2026-06/1781356954868-7ph12sc2bo8.png	6	t	2026-06-13 13:07:37.15	2026-06-13 13:22:36.058
7	Phạm Thị Phương	Trưởng BP Thuế Kế Toán		/uploads/2026-06/1781356962388-4qxh7v1nws5.png	7	t	2026-06-13 13:07:37.15	2026-06-13 13:22:43.362
8	Trần Kim My	Chuyên Viên Thuế Kế Toán		/uploads/2026-06/1781356969771-n7dzxdp6gr8.png	8	t	2026-06-13 13:07:37.15	2026-06-13 13:22:50.937
9	Võ Thị Thu Ngân	Chuyên Viên Thuế Kế Toán		/uploads/2026-06/1781356977155-ptb9n5p6wm.png	9	t	2026-06-13 13:07:37.15	2026-06-13 13:22:58.378
10	Ninh Thị Ngọc Yến	Chuyên Viên Thuế Kế Toán		/uploads/2026-06/1781356986204-m6gk1k7kjad.png	10	t	2026-06-13 13:07:37.15	2026-06-13 13:23:07.182
11	Đoàn Thị Ngọc Diễm	Chuyên Viên Thuế Kế Toán		/uploads/2026-06/1781356992622-pvdw5mw2mdc.png	11	t	2026-06-13 13:07:37.15	2026-06-13 13:23:13.829
12	Nguyễn Hồng Hạnh	Chuyên Viên Thuế Kế Toán		/uploads/2026-06/1781356999298-jl2iqvou8dg.png	12	t	2026-06-13 13:07:37.15	2026-06-13 13:23:23.831
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."Testimonial" (id, name, role, company, text, avatar, rating, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
1	Võ Minh Trúc	Giám Đốc	CTY TNHH Võ Han Minh	Đánh giá cao về sự chuyên môn cũng như trách nhiệm trong công việc, báo cáo thuế đúng quy định.	\N	5	1	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
2	Phạm Xuân Kim	Giám Đốc	CTY TNHH Sắt Thép Kim Trung	Dịch vụ thành lập công ty rất chuyên nghiệp và đúng hẹn, tiết kiệm thời gian và chi phí.	\N	5	2	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
3	Lê Ngọc Minh	Giám Đốc	CTY TNHH BĐS Lê Trang	Hoàn toàn tin tưởng bàn giao tất cả công việc dịch vụ kế toán thuế với những thủ tục chính xác.	\N	5	3	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
4	Lê Văn Tiến	Giám Đốc	CTY TNHH In Ấn Hoàng Anh Tiến	Nhân viên đại diện giải quyết vấn đề nhanh chóng và hiệu quả nhất.	\N	5	4	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
5	Nguyễn Ngọc Thu	Giám Đốc	CTY TNHH Hankook Crane	Hoàn toàn yên tâm không cần phải lo các vấn đề pháp lý của công ty.	\N	5	5	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
6	Tôn Đức Lâm	Giám Đốc	CTY TNHH Cơ Khí Năng Lượng Tôn Nguyễn Phát	Các bạn rất nhiệt tình, tư vấn rất kỹ về các vấn đề ngành nghề, vốn, thuế.	\N	5	6	t	2026-06-13 13:07:37.148	2026-06-13 13:07:37.148
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: jaycao
--

COPY public."User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt") FROM stdin;
1	admin@ketoananpha.vn	$2a$12$v.2hGmFJHDZFEavgmilCI.YLQTBbShe0y7c/5MLGW562/bHLdDKgK	Super Admin	SUPER_ADMIN	t	2026-06-13 13:07:37.104	2026-06-13 13:07:37.104
\.


--
-- Name: Banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Banner_id_seq"', 1, true);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Category_id_seq"', 4, true);


--
-- Name: Contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Contact_id_seq"', 1, false);


--
-- Name: MenuItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."MenuItem_id_seq"', 5, true);


--
-- Name: Office_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Office_id_seq"', 6, true);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Post_id_seq"', 4, true);


--
-- Name: Service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Service_id_seq"', 8, true);


--
-- Name: Setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Setting_id_seq"', 35, true);


--
-- Name: TeamMember_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."TeamMember_id_seq"', 12, true);


--
-- Name: Testimonial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."Testimonial_id_seq"', 6, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jaycao
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: Office Office_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Office"
    ADD CONSTRAINT "Office_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: jaycao
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Post_slug_key; Type: INDEX; Schema: public; Owner: jaycao
--

CREATE UNIQUE INDEX "Post_slug_key" ON public."Post" USING btree (slug);


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: jaycao
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: Setting_key_key; Type: INDEX; Schema: public; Owner: jaycao
--

CREATE UNIQUE INDEX "Setting_key_key" ON public."Setting" USING btree (key);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: jaycao
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: MenuItem MenuItem_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jaycao
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: jaycao
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict vRBHWdSXsoeccOZ6ekkICS4L1HxQxNfIplFhtiMlMaRd0LqEWdLlQYNgR4zVigo

