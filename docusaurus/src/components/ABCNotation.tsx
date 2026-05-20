import React, { useRef, useEffect } from 'react';
import abcjs from 'abcjs';

interface ABCNotationProps {
    abcString: string;
}

const ABCNotation: React.FC<ABCNotationProps> = ({ abcString }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            // abcjs.renderAbc(ref.current, abcString);
            abcjs.renderAbc(ref.current, abcString, {
                tablature: [
                    {
                        instrument: 'fiddle',
                        // instrument: 'violin',
                        // instrument: 'mandolin',
                    },
                ],
            });
        }
    }, []);

    return <div ref={ref}></div>;
};

export default ABCNotation;
