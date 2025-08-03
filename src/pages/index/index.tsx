import React, { useEffect, useState, useCallback } from "react";
import { Box, Page, Text, Button } from "zmp-ui";
import { useNavigate } from "react-router";

// API基地址
const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// 新闻类型接口
interface NewsType {
  id: number;
  f_ItemName: string;
  f_ItemCode: string;
}

// 新闻项接口
interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_date?: string;
  type: number;
  icon?: string;
}

// API调用函数
const httpPost = async (url: string, data: any = {}) => {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log(`正在调用API: ${fullUrl}`);
    console.log('请求数据:', data);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`响应状态: ${response.status} ${response.statusText}`);
    console.log('响应URL:', response.url);
    
    // 记录响应头信息
    const headersInfo: any = {};
    response.headers.forEach((value, key) => {
      headersInfo[key] = value;
    });
    console.log('响应头:', headersInfo);
    
    if (!response.ok) {
      // 尝试读取错误响应体
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('错误响应体:', errorText);
      } catch (e) {
        console.log('无法读取错误响应体');
      }
      
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API响应结果:', result);
    return result;
  } catch (error) {
    console.error('API调用失败:', error);
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    throw error;
  }
};

// 获取数据项 - 模拟原来的 FETCH_DATAITEM 方法
const fetchDataItem = async (itemCode: string) => {
  try {
    console.log(`调用FETCH_DATAITEM: ${itemCode}`);
    // 根据原始代码，这个方法应该有对应的API端点
    const response = await httpPost('/data/dataitem/list', {
      itemCode: itemCode
    });
    return response.data || [];
  } catch (error) {
    console.error('获取数据项失败:', error);
    throw error;
  }
};

// HTTP_POST 方法 - 模拟原来的 HTTP_POST 方法
const httpPostMethod = async (config: { url: string; data: any }) => {
  try {
    console.log(`调用HTTP_POST: ${config.url}`);
    const response = await httpPost(config.url, config.data);
    return response.data || [];
  } catch (error) {
    console.error('HTTP_POST调用失败:', error);
    throw error;
  }
};

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [toggleTitle, setToggleTitle] = useState(0);
  const [messageList, setMessageList] = useState<NewsType[]>([]);
  const [listALL, setListALL] = useState<NewsItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [displayedNewsList, setDisplayedNewsList] = useState<NewsItem[]>([]);
  const [loadCount] = useState(10);
  const [currentLoadIndex, setCurrentLoadIndex] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // 初始化数据加载
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        console.log('开始初始化数据加载...');
        
        // 首先测试API服务器连通性
        console.log('测试API基地址连通性:', API_BASE_URL);
        
        // 并行获取标签标题列表和新闻列表数据 - 完全按照原始Vue代码的方式
        const [messageListRes, newsListRes] = await Promise.all([
          // 获取标签标题列表数据 - 使用原始的 FETCH_DATAITEM 方法
          fetchDataItem('NewsType'),
          // 获取新闻列表数据 - 使用原始的 HTTP_POST 方法和路径
          httpPostMethod({
            url: '/data/dbsource/newsList/list',
            data: {
              paramsJson: "{}",
              sidx: ""
            }
          })
        ]);
        
        console.log('标签数据响应:', messageListRes);
        console.log('新闻数据响应:', newsListRes);
        
        // 设置标签列表 - 不使用备用数据
        if (messageListRes && messageListRes.length > 0) {
          setMessageList(messageListRes);
          console.log('成功设置标签列表:', messageListRes);
        } else {
          console.error('标签数据为空，无法继续');
          setMessageList([]);
        }
        
        // 设置新闻列表 - 不使用备用数据
        if (newsListRes && newsListRes.length > 0) {
          setListALL(newsListRes);
          console.log('成功设置新闻列表:', newsListRes);
        } else {
          console.error('新闻数据为空，无法继续');
          setListALL([]);
        }
        
        // 只在有数据时初始化切换到第一个标签
        if (messageListRes && messageListRes.length > 0) {
          switchTab(0);
        }
        
      } catch (error) {
        console.error('数据加载完全失败:', error);
        console.error('错误详情:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError'
        });
        
        // 不使用任何备用数据，让错误暴露出来
        setMessageList([]);
        setListALL([]);
      } finally {
        setIsLoading(false);
        console.log('数据加载流程结束');
      }
    };

    initData();
  }, []);

  // 标签切换功能
  const switchTab = useCallback(async (tabIndex: number) => {
    if (isSwitching) return;
    
    // 设置正在切换标签的标志为 true
    setIsSwitching(true);
    // 设置正在进行动画的标志为 true
    setIsAnimating(true);
    // 更新切换标题的过渡状态
    setToggleTitle(tabIndex);
    // 更新当前选中的标签索引
    setCurrentTab(tabIndex);
    
    // 延迟 0.5 秒，实现动画过渡效果
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 使用 filter 方法过滤出当前选中标签对应的新闻列表
    const filteredNews = listALL.filter(res => res.type === tabIndex + 1);
    setNewsList(filteredNews);
    
    // 重置当前加载的索引为 0
    setCurrentLoadIndex(0);
    // 加载数据
    loadData(filteredNews);
    
    // 设置正在进行动画的标志为 false
    setIsAnimating(false);
    // 设置正在切换标签的标志为 false
    setIsSwitching(false);
  }, [listALL, isSwitching, loadCount]);

  // 加载数据的方法
  const loadData = useCallback((newsData?: NewsItem[]) => {
    const dataToUse = newsData || newsList;
    // 计算本次加载的起始索引
    const start = currentLoadIndex;
    // 计算本次加载的结束索引
    const end = start + loadCount;
    // 截取当前选中标签对应的新闻列表中从起始索引到结束索引的数据，赋值给 displayedNewsList
    setDisplayedNewsList(dataToUse.slice(0, end));
    // 更新当前加载的索引
    setCurrentLoadIndex(end);
    // 判断是否还有更多数据可供加载
    setHasMoreData(end < dataToUse.length);
  }, [newsList, currentLoadIndex, loadCount]);

  // 加载更多数据的方法
  const loadMoreData = useCallback(async () => {
    // 当还有更多数据且不在加载状态和切换标签状态时，进行加载更多操作
    if (hasMoreData && !isLoading && !isSwitching) {
      // 设置正在加载数据的标志为 true
      setIsLoading(true);
      try {
        // 计算本次加载更多的起始索引
        const start = currentLoadIndex;
        // 计算本次加载更多的结束索引
        const end = start + loadCount;
        // 截取当前选中标签对应的新闻列表中从起始索引到结束索引的数据
        const newData = newsList.slice(start, end);
        // 将新数据追加到当前显示的新闻列表中
        setDisplayedNewsList(prev => [...prev, ...newData]);
        // 更新当前加载的索引
        setCurrentLoadIndex(end);
        // 判断是否还有更多数据可供加载
        setHasMoreData(end < newsList.length);
      } catch (error) {
        // 加载更多数据失败时，在控制台输出错误信息
        console.error('加载更多数据失败:', error);
      } finally {
        // 无论加载成功还是失败，都将正在加载数据的标志设置为 false
        setIsLoading(false);
      }
    }
  }, [hasMoreData, isLoading, isSwitching, currentLoadIndex, loadCount, newsList]);

  // 点击新闻项跳转详情页的方法
  const goNewMessage = useCallback((message: NewsItem) => {
    // 当不在切换标签状态时，进行跳转操作
    if (!isSwitching) {
      // 显示加载提示（模拟）
      setIsLoading(true);
      // 延迟 1.5 秒后跳转到新闻详情页
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/news-detail?id=${message.id}`, {
          state: { newsItem: message }
        });
      }, 1500);
    }
  }, [navigate, isSwitching]);

  return (
    <Page className="flex flex-col h-screen bg-gray-50">
      {/* 导航栏部分 */}
      <Box className="bg-primary text-white px-6 py-4 shadow-md">
        <Text className="text-white text-lg font-bold text-center">
          新闻资讯与公告
        </Text>
      </Box>
      
      {/* 资讯与公告切换标签栏 */}
      <Box className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <Box className="flex">
          {messageList.map((title, index) => (
            <Button
              key={title.id}
              className={`flex-1 py-4 px-2 text-center transition-all duration-300 ${
                currentTab === index
                  ? 'text-primary border-b-3 border-primary bg-blue-50 font-semibold transform scale-105'
                  : 'text-gray-600 border-b-3 border-transparent'
              }`}
              variant="tertiary"
              onClick={() => !isSwitching && switchTab(index)}
              disabled={isSwitching}
            >
              <Text className={currentTab === index ? 'font-semibold text-primary' : 'text-gray-600'}>
                {title.f_ItemName}
              </Text>
            </Button>
          ))}
        </Box>
      </Box>

      {/* 内容区域 */}
      <Box className="flex-1 overflow-auto p-4">
        {/* 根据当前选中的标签显示对应的资讯列表 */}
        {currentTab === toggleTitle && (
          <Box className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {displayedNewsList.length > 0 ? (
              <Box className="space-y-4">
                {/* 循环渲染每条新闻资讯 */}
                {displayedNewsList.map((news, index) => (
                  <Box
                    key={news.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 ${
                      isSwitching ? 'opacity-70' : 'opacity-100'
                    }`}
                    onClick={() => !isSwitching && goNewMessage(news)}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <Box className="flex p-4">
                      {/* 新闻缩略图区域 */}
                      <Box className="w-28 h-20 mr-5 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {/* 显示新闻的缩略图，如果没有则显示默认图片 */}
                        <img
                          src={news.icon || '/static/logo.png'}
                          alt={news.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/static/logo.png';
                          }}
                        />
                      </Box>
                      
                      {/* 新闻信息区域 */}
                      <Box className="flex-1 flex flex-col justify-between">
                        {/* 新闻标题 */}
                        <Text className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-relaxed">
                          {news.title}
                        </Text>
                        {/* 新闻发布日期，如果没有则显示 '暂无发布日期' */}
                        <Text className="text-xs text-gray-500">
                          {news.published_date || '暂无发布日期'}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                ))}
                
                {/* 加载更多提示，当还有更多数据且不在加载状态时显示 */}
                {hasMoreData && !isLoading && (
                  <Box className="text-center py-6">
                    <Button
                      onClick={loadMoreData}
                      variant="tertiary"
                      className="text-primary px-8 py-2"
                    >
                      加载更多...
                    </Button>
                  </Box>
                )}
                
                {/* 加载动画，当正在加载数据时显示 */}
                {isLoading && (
                  <Box className="text-center py-8">
                    {/* 旋转的加载图标 */}
                    <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
                    {/* 加载提示文字 */}
                    <Text className="text-gray-500">加载中...</Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Box className="text-center py-20">
                {isLoading ? (
                  <Box>
                    <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
                    <Text className="text-gray-500">加载中...</Text>
                  </Box>
                ) : (
                  <Box>
                    <Text className="text-gray-500 text-lg mb-2">📰</Text>
                    <Text className="text-gray-500">暂无新闻数据</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default HomePage;
