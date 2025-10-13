"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { evaluateAndMatch } from "@/lib/api";
import { ProjectData } from "@/lib/types";
import { PROJECT_TYPES, ALL_SKILLS } from "@/lib/constants";

export default function ProjectForm() {
  const router = useRouter();
  const {
    projectData,
    setProjectData,
    addMessage,
    setMatchResults,
    setIsLoading,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectData>({
    defaultValues: {
      title: "",
      project_type: [],
      required_skills: [],
      preferred_skills: [],
      start_date: "",
      end_date: "",
      additional_requirements: "",
    },
  });

  // ストアから値を復元（初回マウント時のみ）
  useEffect(() => {
    if (projectData && Object.keys(projectData).length > 0) {
      console.log("📥 Loading saved data:", projectData);
      reset(projectData);
    }
  }, []);

  const onSubmit = async (data: ProjectData) => {
    try {
      setError(null);
      setIsLoading(true);
      setProjectData(data);

      // Edge Functionにリクエスト
      const response = await evaluateAndMatch({
        project: data,
        message: data.title,
      });

      if (response.type === "question") {
        // LLMから質問が返ってきた場合 → チャット画面へ
        addMessage({ role: "assistant", message: response.message });
        router.push("/chat");
      } else {
        // マッチング結果が返ってきた場合 → 結果画面へ
        setMatchResults(response.data, response.requirements);
        router.push("/results");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "案件の送信に失敗しました。もう一度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          案件タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="input-field"
          placeholder="例: 社内RAGシステム構築"
          {...register("title", {
            required: "タイトルを入力してください",
            minLength: {
              value: 3,
              message: "タイトルは3文字以上で入力してください",
            },
          })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 案件概要セクション */}
      <div className="border-t border-light-border dark:border-dark-border pt-6">
        <h3 className="text-lg font-semibold mb-4">案件概要</h3>

        <div className="space-y-6">
          {/* 業務内容（チェックボックス） */}
          <div>
            <label className="block text-sm font-medium mb-3">
              業務内容 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="project_type"
              control={control}
              rules={{
                required: "業務内容を1つ以上選択してください",
              }}
              render={({ field }) => {
                const currentValues = (field.value as string[]) || [];
                const showOtherInput = currentValues.includes("other");

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(PROJECT_TYPES).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={key}
                            checked={currentValues.includes(key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...currentValues, key]);
                              } else {
                                field.onChange(
                                  currentValues.filter((v) => v !== key)
                                );
                              }
                            }}
                            className="w-4 h-4 text-accent border-light-border dark:border-dark-border rounded focus:ring-2 focus:ring-accent"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>

                    {showOtherInput && (
                      <div className="mt-3 ml-6">
                        <input
                          type="text"
                          placeholder="その他の業務内容を入力してください"
                          className="input-field"
                          {...register("project_type_other", {
                            required: showOtherInput
                              ? "その他の業務内容を入力してください"
                              : false,
                          })}
                        />
                        {errors.project_type_other && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.project_type_other.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {errors.project_type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.project_type.message}
              </p>
            )}
          </div>

          {/* 必須スキル（チェックボックス） */}
          <div>
            <label className="block text-sm font-medium mb-3">
              必須スキル <span className="text-red-500">*</span>
            </label>
            <Controller
              name="required_skills"
              control={control}
              rules={{
                required: "必須スキルを1つ以上選択してください",
              }}
              render={({ field }) => {
                const currentValues = (field.value as string[]) || [];
                const showOtherInput = currentValues.includes("その他");

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-light-border dark:border-dark-border rounded-lg p-3">
                      {ALL_SKILLS.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={skill}
                            checked={currentValues.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...currentValues, skill]);
                              } else {
                                field.onChange(
                                  currentValues.filter((v) => v !== skill)
                                );
                              }
                            }}
                            className="w-4 h-4 text-accent border-light-border dark:border-dark-border rounded focus:ring-2 focus:ring-accent"
                          />
                          <span className="text-xs">{skill}</span>
                        </label>
                      ))}
                    </div>

                    {showOtherInput && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="その他のスキルを入力してください"
                          className="input-field"
                          {...register("required_skills_other", {
                            required: showOtherInput
                              ? "その他のスキルを入力してください"
                              : false,
                          })}
                        />
                        {errors.required_skills_other && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.required_skills_other.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {errors.required_skills && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.required_skills.message}
              </p>
            )}
          </div>

          {/* あると望ましいスキル（チェックボックス） */}
          <div>
            <label className="block text-sm font-medium mb-3">
              あると望ましいスキル <span className="text-red-500">*</span>
            </label>
            <Controller
              name="preferred_skills"
              control={control}
              rules={{
                required: "あると望ましいスキルを1つ以上選択してください",
              }}
              render={({ field }) => {
                const currentValues = (field.value as string[]) || [];
                const showOtherInput = currentValues.includes("その他");

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-light-border dark:border-dark-border rounded-lg p-3">
                      {ALL_SKILLS.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={skill}
                            checked={currentValues.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...currentValues, skill]);
                              } else {
                                field.onChange(
                                  currentValues.filter((v) => v !== skill)
                                );
                              }
                            }}
                            className="w-4 h-4 text-accent border-light-border dark:border-dark-border rounded focus:ring-2 focus:ring-accent"
                          />
                          <span className="text-xs">{skill}</span>
                        </label>
                      ))}
                    </div>

                    {showOtherInput && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="その他のスキルを入力してください"
                          className="input-field"
                          {...register("preferred_skills_other", {
                            required: showOtherInput
                              ? "その他のスキルを入力してください"
                              : false,
                          })}
                        />
                        {errors.preferred_skills_other && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.preferred_skills_other.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            {errors.preferred_skills && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.preferred_skills.message}
              </p>
            )}
          </div>

          {/* 開始日・終了日 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 希望開始日 */}
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium mb-2"
              >
                希望開始日
              </label>
              <input
                id="start_date"
                type="date"
                className="input-field"
                {...register("start_date")}
              />
            </div>

            {/* 終了日 */}
            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium mb-2"
              >
                終了日
              </label>
              <input
                id="end_date"
                type="date"
                className="input-field"
                {...register("end_date")}
              />
            </div>
          </div>

          {/* その他のご要望 */}
          <div>
            <label
              htmlFor="additional_requirements"
              className="block text-sm font-medium mb-2"
            >
              その他のご要望
            </label>
            <textarea
              id="additional_requirements"
              rows={4}
              className="input-field"
              placeholder="例: リモートワーク必須、週3日稼働、英語でのコミュニケーション可能な方など"
              {...register("additional_requirements")}
            />
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              送信中...
            </span>
          ) : (
            "次へ"
          )}
        </button>
      </div>
    </form>
  );
}
