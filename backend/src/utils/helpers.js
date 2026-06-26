function camelizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    studentNo: row.student_no,
    realName: row.real_name,
    college: row.college,
    major: row.major,
    grade: row.grade,
    skillDirection: row.skill_direction,
    role: row.role,
    averageScore: row.average_score !== undefined && row.average_score !== null ? Number(row.average_score) : undefined,
    reviewCount: row.review_count !== undefined && row.review_count !== null ? Number(row.review_count) : undefined,
    willingAgainRate:
      row.willing_again_rate !== undefined && row.willing_again_rate !== null ? Number(row.willing_again_rate) : undefined,
    favoritedAt: row.favorited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function camelizeProject(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    teamName: row.team_name,
    startDate: row.start_date,
    endDate: row.end_date,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    status: row.status,
    description: row.description,
    memberCount: row.member_count !== undefined && row.member_count !== null ? Number(row.member_count) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseTags(tagString) {
  if (!tagString) {
    return [];
  }

  return String(tagString)
    .split("||")
    .filter(Boolean)
    .map((item) => {
      const [id, displayName, type, name] = item.split("::");
      return {
        id: Number(id),
        displayName,
        type,
        name
      };
    });
}

function camelizeReview(row, options = {}) {
  if (!row) {
    return null;
  }

  const review = {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    revieweeName: row.reviewee_name,
    overallScore: Number(row.overall_score),
    taskScore: row.task_score !== null ? Number(row.task_score) : null,
    communicationScore: row.communication_score !== null ? Number(row.communication_score) : null,
    responsibilityScore: row.responsibility_score !== null ? Number(row.responsibility_score) : null,
    skillScore: row.skill_score !== null ? Number(row.skill_score) : null,
    willingAgain: row.willing_again === 1,
    comment: row.comment,
    status: row.status,
    hiddenReason: row.hidden_reason || "",
    tags: parseTags(row.tags),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (options.includeReviewerName) {
    review.reviewerName = row.reviewer_name;
  }

  if (!options.includeReviewerId) {
    delete review.reviewerId;
  }

  return review;
}

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return String(value).toLowerCase() === "true";
}

module.exports = {
  camelizeProject,
  camelizeReview,
  camelizeUser,
  parseTags,
  toBoolean
};
