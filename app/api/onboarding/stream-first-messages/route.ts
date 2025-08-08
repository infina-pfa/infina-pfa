import { OnboardingMessage } from "@/lib/types/onboarding.types";
import { NextResponse } from "next/server";

interface MessageWithMetadata extends OnboardingMessage {
  metadata?: {
    component: {
      type: string;
      title: string;
      context: Record<string, unknown>;
      isCompleted: boolean;
    };
  };
}

const messages: MessageWithMetadata[] = [
  {
    content:
      "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình và cung cấp hướng dẫn cụ thể phù hợp với tình hình tài chính hiện tại của bạn.\n✨ Để tôi có thể hỗ trợ bạn tốt nhất, hãy cho tôi biết bạn đang ở giai đoạn nào trong hành trình tài chính.",
    type: "ai",
    timestamp: new Date(),
    id: "1",
    component: undefined,
  },
  {
    content:
      "Tôi sẽ hỏi bạn 2 câu hỏi ngắn để xác định chính xác ưu tiên tài chính của bạn",
    type: "ai",
    timestamp: new Date(),
    id: "2",
    metadata: {
      component: {
        type: "decision_tree",
        title: "Hãy xác định ưu tiên tài chính của bạn",
        context: {
          questions: [
            {
              id: "high_interest_debt",
              question:
                "Bạn có bất kỳ khoản nợ nào, chẳng hạn như dư nợ thẻ tín dụng hoặc các khoản vay cá nhân, với lãi suất cao hơn 8% không?",
              explanation:
                "Vui lòng loại trừ khoản thế chấp chính hoặc các khoản vay sinh viên lãi suất thấp.",
              yesLabel: "Có",
              noLabel: "Không",
            },
            {
              id: "emergency_fund",
              question:
                "Nếu bạn mất nguồn thu nhập chính ngày hôm nay, bạn có đủ tiền mặt trong tài khoản tiết kiệm dễ tiếp cận để trang trải tất cả các chi phí sinh hoạt thiết yếu trong ít nhất ba tháng không?",
              explanation:
                "Chi phí thiết yếu bao gồm nhà ở, thực phẩm, tiện ích, giao thông và các nhu cầu thiết yếu khác.",
              yesLabel: "Có",
              noLabel: "Không",
            },
          ],
        },
        isCompleted: false,
      },
    },
  },
];

export const GET = async () => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status event
        const startEvent = {
          type: "status",
          data: { status_type: "started" },
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(startEvent)}\n\n`)
        );

        // Process each message
        for (const message of messages) {
          // Send text content
          if (message.content) {
            // Split content into chunks for streaming effect
            const words = message.content.split(" ");
            for (let i = 0; i < words.length; i++) {
              const chunk = words[i] + (i < words.length - 1 ? " " : "");
              const textEvent = {
                type: "text",
                content: chunk,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(textEvent)}\n\n`)
              );
              // Add small delay for streaming effect
              await new Promise((resolve) => setTimeout(resolve, 30));
            }

            // Send text completed status
            const textCompletedEvent = {
              type: "status",
              data: { status_type: "text_completed" },
              content: message.content,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(textCompletedEvent)}\n\n`)
            );
          }

          // Send component if exists
          if (message.metadata?.component) {
            const functionCallEvent = {
              type: "function_call",
              content: message.content || "",
              data: {
                function_args: {
                  component_id: `component-${Date.now()}`,
                  title: message.metadata.component.title,
                  component_type: message.metadata.component.type,
                  context: message.metadata.component.context,
                },
              },
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(functionCallEvent)}\n\n`)
            );
          }
        }

        // Send completion event
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        const errorEvent = {
          type: "error",
          error: error instanceof Error ? error.message : "Stream failed",
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
