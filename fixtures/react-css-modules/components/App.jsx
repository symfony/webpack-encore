import './styles.css';
import './styles.less';
import './styles.scss';
import './styles.stylus';
import stylesCss from './styles.module.css?module';
import stylesLess from './styles.module.less?module';
import stylesScss from './styles.module.scss?module';
import stylesStylus from './styles.module.stylus?module';

export default function App() {
    return <div className={`red large justified lowercase ${stylesCss.italic} ${stylesLess.underline} ${stylesScss.bold} ${stylesStylus.rtl}`}></div>
}
