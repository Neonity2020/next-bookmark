import { NextApiRequest, NextApiResponse } from 'next';
import * as cheerio from 'cheerio';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: '需要提供 URL 参数' });
  }

  try {
    // 直接获取 HTML 文本
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 按优先级查找 Open Graph 图片
    let ogImage = $('meta[property="og:image"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 $('link[rel="image_src"]').attr('href') ||
                 $('img').first().attr('src');

    if (ogImage) {
      // 确保 URL 是完整的
      if (ogImage.startsWith('//')) {
        ogImage = 'https:' + ogImage;
      } else if (ogImage.startsWith('/')) {
        const urlObj = new URL(url);
        ogImage = `${urlObj.protocol}//${urlObj.host}${ogImage}`;
      }

      return res.status(200).json({ ogImage });
    }

    return res.status(404).json({ error: '未找到图片' });
  } catch (error) {
    console.error('获取 OG 图片错误:', error);
    return res.status(500).json({ error: '获取图片失败' });
  }
} 