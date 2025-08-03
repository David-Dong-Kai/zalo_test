import { atom, selector } from "recoil";
import { NewsType, NewsItem } from "types/news";

// 新闻类型列表状态
export const newsTypesState = atom<NewsType[]>({
  key: "newsTypes",
  default: [],
});

// 所有新闻列表状态
export const allNewsListState = atom<NewsItem[]>({
  key: "allNewsList",
  default: [],
});

// 当前选中的新闻类型索引
export const currentNewsTabState = atom<number>({
  key: "currentNewsTab",
  default: 0,
});

// 当前显示的新闻列表 (基于选中的类型过滤)
export const currentNewsListState = selector<NewsItem[]>({
  key: "currentNewsList",
  get: ({ get }) => {
    const allNews = get(allNewsListState);
    const currentTab = get(currentNewsTabState);
    return allNews.filter(news => news.type === currentTab + 1);
  },
});

// API基地址
export const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// 模拟HTTP请求函数
export const httpPost = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 模拟数据获取函数
export const fetchDataItem = async (type: string): Promise<NewsType[]> => {
  // 模拟新闻类型数据
  const mockNewsTypes: NewsType[] = [
    { id: 1, f_ItemName: "资讯", f_ItemCode: "news" },
    { id: 2, f_ItemName: "公告", f_ItemCode: "announcement" },
    { id: 3, f_ItemName: "活动", f_ItemCode: "activity" },
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockNewsTypes), 500);
  });
};
