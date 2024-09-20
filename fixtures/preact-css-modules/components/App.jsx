import { h } from 'preact';
import './styles.css';
import './styles.less';
import './styles.scss';
import './styles.stylus';
import * as stylesCss from './styles.module.css?module';
import * as stylesLess from './styles.module.less?module';
import * as stylesScss from './styles.module.scss?module';
import * as stylesStylus from './styles.module.stylus?module';

export default function App() {
    return <div className={`red large justified lowercase ${stylesCss.italic} ${stylesLess.underline} ${stylesScss.bold} ${stylesStylus.rtl}`}></div>
}
