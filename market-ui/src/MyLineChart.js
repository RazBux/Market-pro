import { ResponsiveLine } from '@nivo/line'




const MyLineChart = () => {
    const data = [
        {
          "id": "japan",
          "color": "hsl(59, 70%, 50%)",
          "data": [
            {
              "x": "plane",
              "y": 194
            },
            {
              "x": "helicopter",
              "y": 48
            },
            {
              "x": "boat",
              "y": 185
            },
            {
              "x": "train",
              "y": 208
            },
            {
              "x": "subway",
              "y": 255
            },
            {
              "x": "bus",
              "y": 282
            },
            {
              "x": "car",
              "y": 70
            },
            {
              "x": "moto",
              "y": 163
            },
            {
              "x": "bicycle",
              "y": 57
            },
            {
              "x": "horse",
              "y": 243
            },
            {
              "x": "skateboard",
              "y": 7
            },
            {
              "x": "others",
              "y": 206
            }
          ]
        },
        {
          "id": "france",
          "color": "hsl(295, 70%, 50%)",
          "data": [
            {
              "x": "plane",
              "y": 75
            },
            {
              "x": "helicopter",
              "y": 293
            },
            {
              "x": "boat",
              "y": 268
            },
            {
              "x": "train",
              "y": 166
            },
            {
              "x": "subway",
              "y": 39
            },
            {
              "x": "bus",
              "y": 174
            },
            {
              "x": "car",
              "y": 145
            },
            {
              "x": "moto",
              "y": 81
            },
            {
              "x": "bicycle",
              "y": 81
            },
            {
              "x": "horse",
              "y": 299
            },
            {
              "x": "skateboard",
              "y": 157
            },
            {
              "x": "others",
              "y": 97
            }
          ]
        }
      ]
      
      
    console.log(data);
    return (
        <ResponsiveLine
            data={data}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: true,
                reverse: false
            }}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'transportation',
                legendOffset: 36,
                legendPosition: 'middle',
                truncateTickAt: 0
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'count',
                legendOffset: -40,
                legendPosition: 'middle',
                truncateTickAt: 0
            }}
            enableGridX={false}
            pointSize={5}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabel="data.yFormatted"
            pointLabelYOffset={-17}
            areaOpacity={0.05}
            enableCrosshair={false}
            enableTouchCrosshair={true}
            useMesh={true}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
        />
    );
};

export default MyLineChart;