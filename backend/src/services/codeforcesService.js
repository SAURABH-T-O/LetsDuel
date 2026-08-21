import crypto from 'crypto';
import { env } from '../config/env.js';
import { SUBMISSION_STATUSES } from '../constants/gameModes.js';
import { AppError } from '../utils/AppError.js';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

const hasCodeforcesCredentials = () => {
  return Boolean(env.codeforces.apiKey && env.codeforces.apiSecret);
};

const createApiSignature = ({ methodName, params, secret }) => {
  const randomPrefix = crypto.randomBytes(3).toString('hex');
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signaturePayload = `${randomPrefix}/${methodName}?${sortedParams}#${secret}`;
  const digest = crypto.createHash('sha512').update(signaturePayload).digest('hex');

  return `${randomPrefix}${digest}`;
};

const buildCodeforcesUrl = (methodName, methodParams = {}) => {
  const params = {
    ...methodParams,
  };

  if (hasCodeforcesCredentials()) {
    params.apiKey = env.codeforces.apiKey;
    params.time = Math.floor(Date.now() / 1000);
    params.apiSig = createApiSignature({
      methodName,
      params,
      secret: env.codeforces.apiSecret,
    });
  }

  const query = new URLSearchParams();

  Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .forEach(([key, value]) => {
      query.set(key, String(value));
    });

  return `${CODEFORCES_API_BASE}/${methodName}?${query.toString()}`;
};

const safeFetchJson = async (methodName, params = {}) => {
  const url = buildCodeforcesUrl(methodName, params);

  let response;

  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'LetsDuelBackend/1.0',
      },
    });
  } catch {
    throw new AppError('Unable to reach Codeforces right now', 502);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new AppError('Codeforces rate limit reached. Please try again shortly.', 429);
    }

    throw new AppError('Unable to reach Codeforces right now', 502);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    const comment = data.comment || 'Codeforces request failed';
    const isRateLimited = /limit|too many|rate/i.test(comment);
    throw new AppError(comment, isRateLimited ? 429 : 400);
  }

  return data.result;
};

export const mapCodeforcesVerdictToStatus = (verdict) => {
  if (!verdict) return SUBMISSION_STATUSES.RUNNING;

  const normalizedVerdict = verdict.toUpperCase();

  if (normalizedVerdict === 'OK') return SUBMISSION_STATUSES.ACCEPTED;
  if (normalizedVerdict === 'COMPILATION_ERROR') return SUBMISSION_STATUSES.COMPILATION_ERROR;
  if (normalizedVerdict === 'TIME_LIMIT_EXCEEDED') return SUBMISSION_STATUSES.TIME_LIMIT_EXCEEDED;
  if (normalizedVerdict === 'RUNTIME_ERROR') return SUBMISSION_STATUSES.RUNTIME_ERROR;
  if (normalizedVerdict === 'WRONG_ANSWER') return SUBMISSION_STATUSES.WRONG_ANSWER;

  return SUBMISSION_STATUSES.FAILED;
};

export const ensureCodeforcesHandleExists = async (handle) => {
  const users = await safeFetchJson('user.info', { handles: handle });

  if (!Array.isArray(users) || users.length === 0) {
    throw new AppError('Codeforces handle not found', 404);
  }

  return users[0];
};

export const verifyCodeforcesCompilationErrorToken = async ({ handle, token }) => {
  await ensureCodeforcesHandleExists(handle);

  const submissions = await safeFetchJson('user.status', {
    handle,
    from: 1,
    count: 20,
  });

  const normalizedToken = token.trim();

  const matchingSubmission = submissions.find((submission) => {
    const verdictMatches = submission.verdict === 'COMPILATION_ERROR';
    const problemName = submission.problem?.name || '';
    const programmingLanguage = submission.programmingLanguage || '';

    return (
      verdictMatches &&
      (problemName.includes(normalizedToken) || programmingLanguage.includes(normalizedToken))
    );
  });

  return {
    verified: Boolean(matchingSubmission),
    submission: matchingSubmission || null,
  };
};

export const getCodeforcesUserSubmissions = async ({ handle, from = 1, count = 100 }) => {
  await ensureCodeforcesHandleExists(handle);

  return safeFetchJson('user.status', {
    handle,
    from,
    count,
  });
};

export const isCodeforcesSubmissionForProblem = (submission, problem) => {
  if (!submission?.problem || !problem) return false;

  return (
    Number(submission.problem.contestId) === Number(problem.contestId) &&
    String(submission.problem.index).toUpperCase() === String(problem.index).toUpperCase()
  );
};

export const getCodeforcesSubmissionDate = (submission) => {
  if (!submission?.creationTimeSeconds) return null;
  return new Date(submission.creationTimeSeconds * 1000);
};

export const findAcceptedCodeforcesSubmission = ({ submissions, problem, startedAt, endsAt }) => {
  const startedAtMs = startedAt ? new Date(startedAt).getTime() : 0;
  const endsAtMs = endsAt ? new Date(endsAt).getTime() : Number.POSITIVE_INFINITY;

  return submissions
    .filter((submission) => {
      const submittedAt = getCodeforcesSubmissionDate(submission);
      if (!submittedAt) return false;

      const submittedAtMs = submittedAt.getTime();

      return (
        isCodeforcesSubmissionForProblem(submission, problem) &&
        submittedAtMs >= startedAtMs &&
        submittedAtMs <= endsAtMs &&
        submission.verdict === 'OK'
      );
    })
    .sort((submissionA, submissionB) => {
      return submissionA.creationTimeSeconds - submissionB.creationTimeSeconds;
    })[0] || null;
};
