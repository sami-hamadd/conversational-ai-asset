import React, { memo, useEffect, useRef, useState } from 'react';
import { Card, Text, Paper, Loader } from '@mantine/core';
import { theme } from 'theme';
import dynamic from 'next/dynamic';
import MarkdownTable from '@/components/chats/MarkdownTable';
import Plotly from 'plotly.js-dist'; // Import Plotly


const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface MessageCardProps {
  type: 'question' | 'answer';
  content: string | Record<string, any>[] | null;
  messageType?: 'TEXT' | 'AUDIO';
  generated_chart?: any;
  shouldStream?: boolean;
}

const MemoizedPlot = memo(Plot);

export default function MessageCard({
  type,
  content,
  messageType,
  generated_chart,
  shouldStream = false,
}: MessageCardProps) {
  const backgroundColor = type === 'question' ? '#f0f0f0' : '#ffffff';

  const [displayedContent, setDisplayedContent] = useState<React.ReactNode[]>([]);
  const [isPlotReady, setIsPlotReady] = useState(false);
  const [contentStreamingFinished, setContentStreamingFinished] = useState(false);
  // Ref for the plot container
  const plotContainerRef = useRef<HTMLDivElement>(null);
  // Ref for the Plotly graph div
  const plotRef = useRef<any>(null);

  useEffect(() => {
    // Reset states when dependencies change
    setIsPlotReady(false);
    setContentStreamingFinished(false);

    if (
      type === 'answer' &&
      messageType === 'TEXT' &&
      typeof content === 'string'
    ) {
      if (shouldStream) {
        streamContent(content);
      } else {
        // Display content immediately
        setDisplayedContent(processContent(content));
        setContentStreamingFinished(true); // Content is ready
      }
    } else {
      // For questions and other types, display content immediately
      setDisplayedContent(processContent(content as string));
      setContentStreamingFinished(true); // Content is ready
    }
  }, [content, shouldStream, generated_chart, messageType, type]);
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // We are in fullscreen mode
        if (plotContainerRef.current) {
          plotContainerRef.current.style.width = '100vw';
          plotContainerRef.current.style.height = '100vh';
        }
      } else {
        // We have exited fullscreen mode
        if (plotContainerRef.current) {
          plotContainerRef.current.style.width = '100%';
          plotContainerRef.current.style.height = '400px'; // Set your default height here
        }
      }
      if (plotRef.current) {
        Plotly.Plots.resize(plotRef.current);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const streamContent = (fullContent: string) => {
    const parts = fullContent.split(/\n\n+/);
    let index = 0;
    const newContent: React.ReactNode[] = [];

    const streamNextPart = () => {
      if (index >= parts.length) {
        // All parts processed
        setContentStreamingFinished(true);
        return;
      }

      const part = parts[index];
      index++;

      if (
        part.includes('|') &&
        part.split('\n').some((line) => line.startsWith('|'))
      ) {
        // Render table immediately
        newContent.push(
          <MarkdownTable key={`table-${index}`} markdown={part} />
        );
        setDisplayedContent([...newContent]);
        // Proceed to next part after a short delay
        setTimeout(streamNextPart, 500);
      } else {
        // Stream text content character by character
        let charIndex = 0;
        let currentText = '';
        // Add a new Text element to newContent
        newContent.push(
          <Text
            key={`text-${index}`}
            size='sm'
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
          >
          </Text>
        );
        const textElementIndex = newContent.length - 1;
        setDisplayedContent([...newContent]);

        const interval = setInterval(() => {
          if (charIndex <= part.length) {
            currentText = part.slice(0, charIndex);
            // Update the Text element at textElementIndex
            newContent[textElementIndex] = (
              <Text
                key={`text-${index}`}
                size='sm'
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
              >
                {currentText}
              </Text>
            );
            setDisplayedContent([...newContent]);
            charIndex++;
          } else {
            clearInterval(interval);
            setTimeout(streamNextPart, 500);
          }
        }, 20);
      }
    };

    streamNextPart();
  };

  const processContent = (content: string) => {
    const parts = content.split(/\n\n+/);
    return parts.map((part, index) => {
      if (
        part.includes('|') &&
        part.split('\n').some((line) => line.startsWith('|'))
      ) {
        return (
          <MarkdownTable key={`table-${index}`} markdown={part} />
        );
      } else {
        return (
          <Text
            key={`text-${index}`}
            size='sm'
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
          >
            {part}
          </Text>
        );
      }
    });
  };

  if (!content) {
    return null; // Don't render anything if content is null
  }

  return (
    <Card
      p={'0.2rem 0.6rem 0.4rem 0.5rem'}
      radius='xl'
      style={{
        backgroundColor,
        maxWidth: '80%',
        minHeight: 'auto',
        height: 'auto',
        marginBottom: '0.1rem',
      }}
    >
      {messageType === 'TEXT' && typeof content === 'string' ? (
        <>
          {displayedContent}
          {generated_chart && contentStreamingFinished && (
            <>
              {!isPlotReady && (
                <Paper
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    marginTop: '1rem',
                    backgroundColor: '',
                  }}
                >
                  <Text mr='md'>Loading Plot</Text>
                  <Loader color='blue' size='md' />
                </Paper>
              )}
              <div
                ref={plotContainerRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '400px', // Set your default height
                }}
              >
                <MemoizedPlot
                  key={JSON.stringify(generated_chart.data)}
                  data={generated_chart.data}
                  layout={generated_chart.layout}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToAdd: [
                      {
                        name: 'Full Screen',
                        title: 'Toggle Full Screen',
                        icon: {
                          width: 500,
                          height: 500,
                          path: "M 200 50 L 300 50 L 300 200 L 450 200 L 450 300 L 300 300 L 300 450 L 200 450 L 200 300 L 50 300 L 50 200 L 200 200 Z"
                        },
                        click: function (gd: HTMLElement) {
                          const elem = gd as HTMLElement;
                          if (!document.fullscreenElement) {
                            if (elem.requestFullscreen) {
                              elem.requestFullscreen();
                            } else {
                              console.error('Fullscreen API is not supported.');
                            }
                          } else {
                            document.exitFullscreen();
                          }
                        },
                      },
                    ],
                    modeBarButtonsToRemove: [
                      'pan2d',
                      'select2d',
                      'lasso2d',
                      'zoom2d',
                      'zoom3d',
                      'resetScale2d',
                    ],
                  }}
                  style={{ width: '100%', height: '100%' }} // Make Plot fill its container
                  useResizeHandler={true}
                  onInitialized={(figure, graphDiv) => {
                    plotRef.current = graphDiv;
                    setIsPlotReady(true);
                  }}
                  onUpdate={(figure, graphDiv) => {
                    plotRef.current = graphDiv;
                    setIsPlotReady(true);
                  }}
                />
              </div>
            </>
          )}
        </>
      ) : messageType === 'AUDIO' && typeof content === 'string' ? (
        <audio controls>
          <source
            src={`data:audio/webm;base64,${content}`}
            type='audio/webm'
          />
          Your browser does not support the audio element.
        </audio>
      ) : null}
    </Card>
  );
}
