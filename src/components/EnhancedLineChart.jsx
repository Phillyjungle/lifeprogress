import React, { useEffect, useRef } from 'react';
import { LineChart, Line } from 'recharts';
import * as d3 from 'd3';

export const EnhancedLineChart = ({ data, ...props }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Select all line path elements and animate them
      d3.select(chartRef.current)
        .selectAll('path.recharts-line-curve')
        .transition()
        .duration(1200)
        .ease(d3.easeElastic)
        .attrTween('d', function() {
          const previous = d3.select(this).attr('d');
          return function(t) {
            // Interpolate the path
            // This is a simplified version - actual implementation would
            // require more complex path interpolation
            return previous;
          };
        });
    }
  }, [data]);
  
  return (
    <div ref={chartRef}>
      <LineChart data={data} {...props}>
        {props.children}
      </LineChart>
    </div>
  );
}; 