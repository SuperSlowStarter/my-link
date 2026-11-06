import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

/** 404 탭 제목. 검색 제외(noindex)는 Next.js가 404 응답에 자동으로 넣는다 */
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  description: "주소가 바뀌었거나 없는 MyLink 페이지예요.",
};

/** 404: 없는 username(/{username}) 또는 없는 주소 */
export default function NotFound() {
  return <NotFoundView />;
}
