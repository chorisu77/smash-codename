
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Team } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be limited.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateThematicIntro = async (teamName: string, opponentTeamName: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve(`ようこそ、${teamName} チーム！ ${opponentTeamName} チームより先にスマブラエージェントを見つけ出しましょう。頑張ってください！`);
  }

  // プロンプトを変更して、特定の「ミッションブリーフィング」スタイルを避ける
  const prompt = `You are a friendly game assistant for a Super Smash Bros. themed Codenames game. 
Generate a very short (1-2 sentences) and encouraging welcome message in Japanese for the ${teamName} team, who is starting the game against the ${opponentTeamName} team. 
Announce that ${teamName} is starting. 
Keep team names ${teamName} and ${opponentTeamName} in English. 
Output in Japanese.
Example of a style to AVOID: "REDチーム、君たちのミッションだ！戦場に潜むスマブラの仲間たち、君たちのエージェントを見つけ出せ！BLUEチームに先を越されるな、そして紛れ込んだアサシンには気をつけろ！"
Instead, aim for something like: "${teamName}チームの皆さん、ゲーム開始です！${opponentTeamName}チームとのエキサイティングな戦い、頑張ってください！" or "いよいよスタート！先攻は${teamName}チームです。勝利を目指しましょう！"`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating thematic intro from Gemini:", error);
    return `ようこそ、${teamName} チーム！ ${opponentTeamName} チームより先にエージェントを見つけましょう。アサシンには気をつけて！`; // Fallback message
  }
};

export const generateGameOverSummary = async (
  winner: Team | null,
  assassinHitBy: Team | null, // The team that hit the assassin
  winningReason: string // This will already be in Japanese if from App.tsx specific logic
): Promise<string> => {
  if (!ai) {
    return Promise.resolve(
      assassinHitBy
        ? `${assassinHitBy} チームがアサシンを指定しました！ ${winner} チームの不戦勝です！衝撃の展開！`
        : `${winner} チームが勝利を掴みました！ ${winningReason} 見事なプレイでした！`
    );
  }

  // The winningReason is passed in, potentially already in Japanese from App.tsx.
  // The prompt for Gemini describes the context and asks for Japanese output.
  let prompt = `You are a game announcer for a Super Smash Bros. themed Codenames game. Generate a short, exciting, and thematic game summary (1-2 punchy sentences) in Japanese.\n`;
  if (assassinHitBy) {
    prompt += `The game ended dramatically! The ${assassinHitBy} team accidentally revealed the hidden ASSASSIN, handing an unexpected victory to the ${winner} team! The specific reason was: ${winningReason}.`;
  } else if (winner) {
    prompt += `Victory! The ${winner} team masterfully identified all their agents. The specific reason was: ${winningReason}!`;
  } else {
    prompt += "The game has concluded.";
  }
  prompt += `\nMake it sound epic and fun, fitting the Smash Bros. universe. Output in Japanese. Keep team names ${winner} and ${assassinHitBy} in English if they appear in your generated text.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating game over summary from Gemini:", error);
    return assassinHitBy
      ? `驚くべき番狂わせ！ ${assassinHitBy} がアサシンを指定し、${winner} チームが予想外のチャンピオンに輝きました！`
      : `${winner} チームが勝利！激戦を制しました！ ${winningReason}`; // Fallback message
  }
};
