import './content.css';
import Bg from '../assets/bg1.mp4';
import Content1 from './content-1';
import Content2 from './content-2';
import Loader from './loader';

export default function Content({ loading, responseData }) {
    return (
        <div className="cont-main">
            <div className="cont-in">
                <video className="bg-video" autoPlay muted loop>
                    <source src={Bg} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="overlay"></div>

                {!loading && !responseData && <Content1 />}
                {loading && <Loader />}
                {!loading && responseData && <Content2 data={responseData} />}
            </div>
        </div>
    );
}
