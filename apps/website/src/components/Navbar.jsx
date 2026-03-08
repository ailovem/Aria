import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
            <div className="nav-container">
                <div className="logo text-gradient-aria">Aria.</div>
                <ul className="nav-links">
                    <li><a href="#luming-health">鹿鸣健康·数字康养</a></li>
                    <li><a href="#quickstart">30秒上手</a></li>
                    <li><a href="#download">客户端下载</a></li>
                    <li><a href="#core-value">核心架构</a></li>
                    <li><a href="#scenes">全场景聚合</a></li>
                    <li><a href="#deploy">部署模式</a></li>
                    <li><a href="/changelog.html">更新日志</a></li>
                    <li><a href="#security">隐私与合规</a></li>
                </ul>
                <a className="cta-button" href="#download">立即下载</a>
            </div>
        </nav>
    );
};

export default Navbar;
