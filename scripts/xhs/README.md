# XHS 主题到发布自动化

## 能力范围
- 输入主题后自动生成小红书标题、正文、标签。
- 从素材目录读取图片/视频，自动合成 9:16 竖版视频。
- 自动打开小红书创作页，上传视频并填充文案。
- 支持「仅上传待确认」和「自动点击发布」两种模式。

## 准备
- 确保 `ffmpeg` 已安装并可用。
- 首次运行建议使用非无头模式，完成小红书登录。
- 可选：设置 `OPENAI_API_KEY`，启用模型文案生成；未设置时自动使用本地模板文案。

## 快速开始

1) 准备素材目录（可混合图片和视频）  
示例：`/Users/bear/Desktop/xhs-assets`

2) 仅跑文案+剪辑（不上传）  
`npm run xhs:pipeline -- --theme "减脂便当" --assets /Users/bear/Desktop/xhs-assets --skip-upload`

3) 上传但不自动发布  
`npm run xhs:pipeline -- --theme "减脂便当" --assets /Users/bear/Desktop/xhs-assets`

4) 上传并自动点击发布  
`npm run xhs:pipeline -- --theme "减脂便当" --assets /Users/bear/Desktop/xhs-assets --publish`

## 配置文件运行
- 复制 `scripts/xhs/xhs.config.example.json` 到你自己的路径并修改。
- 运行：`npm run xhs:pipeline -- --config /path/to/xhs.config.json`

## 输出结果
- 每次运行输出到：`output/xhs-pipeline/xhs-<timestamp>-<id>/`
- 主要文件：
  - `copy.json`：生成文案
  - `edited-video.mp4`：自动剪辑视频
  - `upload-result.json`：上传执行结果
  - `pipeline-result.json`：全流程回执
